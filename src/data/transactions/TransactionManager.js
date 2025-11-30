import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

/**
 * TransactionManager - Gestion des transactions ACID
 * Garantit la cohérence des données lors d'opérations multi-tables
 * Conforme aux standards ERP modernes (SAP/Salesforce)
 */
class TransactionManager {
  constructor() {
    this.maxRetries = 3
    this.retryDelay = 1000 // ms
  }

  /**
   * Exécuter plusieurs opérations dans une transaction
   * Note: Supabase ne supporte pas nativement les transactions multi-opérations
   * On utilise un pattern de compensation (Saga pattern) pour rollback manuel
   * 
   * @param {Array} operations - Array d'opérations { type: 'INSERT|UPDATE|DELETE', table, data, id? }
   * @param {Object} options - Options { retry, timeout }
   * @returns {Promise<{data: Array, error: Error|null}>}
   */
  async executeTransaction(operations, options = {}) {
    const startTime = Date.now()
    const { retry = this.maxRetries, timeout = 30000 } = options
    const executedOperations = []

    logger.debug('TRANSACTION', 'Début transaction', {
      operationsCount: operations.length,
      operations: operations.map((op) => ({ type: op.type, table: op.table })),
    })

    try {
      // Valider que toutes les opérations sont valides
      this.validateOperations(operations)

      // Exécuter chaque opération séquentiellement
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i]
        let attempt = 0
        let success = false
        let result = null

        // Retry logic pour chaque opération
        while (attempt < retry && !success) {
          try {
            result = await Promise.race([
              this.executeOperation(operation),
              this.createTimeoutPromise(timeout),
            ])

            executedOperations.push({
              operation,
              result,
              index: i,
            })

            success = true
            logger.debug('TRANSACTION', `Opération ${i + 1}/${operations.length} réussie`, {
              type: operation.type,
              table: operation.table,
            })
          } catch (error) {
            attempt++
            logger.warn('TRANSACTION', `Erreur opération ${i + 1}, tentative ${attempt}/${retry}`, {
              error: error.message,
              type: operation.type,
              table: operation.table,
            })

            if (attempt >= retry) {
              // Échec après tous les retries, rollback
              logger.error('TRANSACTION', 'Échec opération, rollback nécessaire', {
                failedOperation: i,
                error: error.message,
              })
              await this.rollback(executedOperations)
              throw new Error(
                `Transaction échouée à l'opération ${i + 1}/${operations.length}: ${error.message}`
              )
            }

            // Attendre avant retry (exponential backoff)
            await this.delay(this.retryDelay * Math.pow(2, attempt - 1))
          }
        }
      }

      const duration = Date.now() - startTime
      logger.info('TRANSACTION', 'Transaction réussie', {
        operationsCount: operations.length,
        duration: `${duration}ms`,
      })

      return {
        data: executedOperations.map((op) => op.result),
        error: null,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('TRANSACTION', 'Transaction échouée', {
        error: error.message,
        duration: `${duration}ms`,
        executedCount: executedOperations.length,
      })

      // Rollback déjà effectué dans la boucle
      return {
        data: null,
        error,
      }
    }
  }

  /**
   * Exécuter une opération unique
   * @param {Object} operation - { type, table, data, id? }
   * @returns {Promise<Object>} Résultat
   */
  async executeOperation(operation) {
    const { type, table, data, id } = operation

    switch (type) {
      case 'INSERT':
        return await this.insert(table, data)
      case 'UPDATE':
        if (!id) throw new Error('ID requis pour UPDATE')
        return await this.update(table, id, data)
      case 'DELETE':
        if (!id) throw new Error('ID requis pour DELETE')
        return await this.delete(table, id)
      case 'UPSERT':
        return await this.upsert(table, data)
      default:
        throw new Error(`Type d'opération inconnu: ${type}`)
    }
  }

  /**
   * Insérer un enregistrement
   */
  async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }

  /**
   * Mettre à jour un enregistrement
   */
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  /**
   * Supprimer un enregistrement
   */
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) throw error
    return { id, deleted: true }
  }

  /**
   * Upsert (insert ou update)
   */
  async upsert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .upsert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }

  /**
   * Rollback des opérations exécutées (compensation)
   * Note: Supabase ne supporte pas les transactions SQL natives
   * On doit faire un rollback manuel (Saga pattern)
   */
  async rollback(executedOperations) {
    logger.warn('TRANSACTION', 'Début rollback', {
      operationsCount: executedOperations.length,
    })

    // Rollback en ordre inverse
    for (let i = executedOperations.length - 1; i >= 0; i--) {
      const { operation, result } = executedOperations[i]

      try {
        switch (operation.type) {
          case 'INSERT':
            // Supprimer ce qui a été inséré
            if (result && result.id) {
              await this.delete(operation.table, result.id)
              logger.debug('TRANSACTION', `Rollback INSERT: supprimé ${operation.table}:${result.id}`)
            }
            break

          case 'UPDATE':
            // Restaurer les anciennes valeurs (nécessite oldData dans l'opération)
            if (operation.oldData && result && result.id) {
              await this.update(operation.table, result.id, operation.oldData)
              logger.debug('TRANSACTION', `Rollback UPDATE: restauré ${operation.table}:${result.id}`)
            }
            break

          case 'DELETE':
            // Restaurer l'enregistrement supprimé (nécessite oldData dans l'opération)
            if (operation.oldData) {
              await this.insert(operation.table, operation.oldData)
              logger.debug('TRANSACTION', `Rollback DELETE: restauré ${operation.table}:${operation.oldData.id}`)
            }
            break
        }
      } catch (rollbackError) {
        logger.error('TRANSACTION', 'Erreur lors du rollback', {
          operationIndex: i,
          error: rollbackError.message,
        })
        // Continuer le rollback même en cas d'erreur
      }
    }

    logger.warn('TRANSACTION', 'Rollback terminé')
  }

  /**
   * Valider que les opérations sont valides
   */
  validateOperations(operations) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Operations doit être un array non vide')
    }

    operations.forEach((op, index) => {
      if (!op.type || !['INSERT', 'UPDATE', 'DELETE', 'UPSERT'].includes(op.type)) {
        throw new Error(`Opération ${index}: type invalide`)
      }
      if (!op.table) {
        throw new Error(`Opération ${index}: table requise`)
      }
      if (op.type === 'UPDATE' || op.type === 'DELETE') {
        if (!op.id) {
          throw new Error(`Opération ${index}: id requis pour ${op.type}`)
        }
      }
      if (op.type === 'INSERT' || op.type === 'UPDATE' || op.type === 'UPSERT') {
        if (!op.data) {
          throw new Error(`Opération ${index}: data requise pour ${op.type}`)
        }
      }
    })
  }

  /**
   * Créer une promesse de timeout
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: opération a pris plus de ${timeout}ms`))
      }, timeout)
    })
  }

  /**
   * Délai (pour retry)
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Exécuter avec retry (pour opérations simples)
   */
  async executeWithRetry(operation, maxRetries = this.maxRetries) {
    let attempt = 0
    while (attempt < maxRetries) {
      try {
        return await Promise.race([
          this.executeOperation(operation),
          this.createTimeoutPromise(30000),
        ])
      } catch (error) {
        attempt++
        logger.warn('TRANSACTION', `Retry ${attempt}/${maxRetries}`, {
          error: error.message,
          type: operation.type,
          table: operation.table,
        })

        if (attempt >= maxRetries) {
          throw error
        }

        await this.delay(this.retryDelay * Math.pow(2, attempt - 1))
      }
    }
  }
}

// Instance singleton
export const transactionManager = new TransactionManager()
export default transactionManager

