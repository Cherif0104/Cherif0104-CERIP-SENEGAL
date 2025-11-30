import { analyticsService } from './analytics.service'

export const moduleStatsService = {
  async getModuleStats(module) {
    return await analyticsService.getModuleStats(module)
  },

  async getAllModulesStats() {
    const modules = [
      'programmes-projets',
      'candidatures',
      'beneficiaires',
      'intervenants',
      'reporting',
    ]

    const stats = {}
    for (const module of modules) {
      stats[module] = await this.getModuleStats(module)
    }

    return stats
  },
}

