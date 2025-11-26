// Utility pour gérer les erreurs Supabase de manière centralisée

export const supabaseErrorHandler = {
  isTableNotFoundError(error) {
    if (!error) return false
    return (
      error.code === 'PGRST116' ||
      (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
      (error.message?.includes('table') && error.message?.includes('does not exist'))
    )
  },

  handleError(error, defaultData = null) {
    if (this.isTableNotFoundError(error)) {
      console.warn('Table Supabase non trouvée, utilisation de données par défaut:', defaultData)
      return { data: defaultData, error: null }
    }
    return { data: null, error }
  },

  async safeQuery(query, tableName, defaultData = null) {
    try {
      const result = await query
      if (result.error && this.isTableNotFoundError(result.error)) {
        console.warn(`Table ${tableName} non trouvée dans Supabase, utilisation de données par défaut`)
        return { data: typeof defaultData === 'function' ? defaultData() : defaultData, error: null }
      }
      if (defaultData !== null && defaultData !== undefined) {
        return this.withFallback(result, defaultData)
      }
      return result
    } catch (error) {
      if (this.isTableNotFoundError(error)) {
        console.warn(`Table ${tableName} non trouvée dans Supabase, utilisation de données par défaut`)
        return { data: typeof defaultData === 'function' ? defaultData() : defaultData, error: null }
      }
      if (defaultData !== null && defaultData !== undefined) {
        return {
          data: typeof defaultData === 'function' ? defaultData() : defaultData,
          error
        }
      }
      return { data: null, error }
    }
  },

  withFallback(result, fallback) {
    const resolveFallback = () =>
      typeof fallback === 'function' ? fallback() : fallback

    if (!fallback) {
      return result
    }

    if (!result || result.error) {
      return {
        data: resolveFallback(),
        error: result?.error || null
      }
    }

    if (
      result.data === null ||
      (Array.isArray(result.data) && result.data.length === 0)
    ) {
      return {
        data: resolveFallback(),
        error: result.error || null
      }
    }

    return result
  }
}

