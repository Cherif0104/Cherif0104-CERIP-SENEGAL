/**
 * Export centralisé de tous les repositories
 * Permet un import unique : import { programmeRepository, projetRepository } from '@/data/repositories'
 */

export { programmeRepository, ProgrammeRepository } from './ProgrammeRepository'
export { projetRepository, ProjetRepository } from './ProjetRepository'
export { candidatRepository, CandidatRepository } from './CandidatRepository'
export { beneficiaireRepository, BeneficiaireRepository } from './BeneficiaireRepository'
export { appelCandidatureRepository, AppelCandidatureRepository } from './AppelCandidatureRepository'
export { referentielRepository, ReferentielRepository } from './ReferentielRepository'
export { tresorerieRepository, TresorerieRepository } from './TresorerieRepository'
export { tempsRepository, TempsRepository } from './TempsRepository'
export { organismeRepository, OrganismeRepository } from './OrganismeRepository'
export { financeurRepository, FinanceurRepository } from './FinanceurRepository'
export { partenaireRepository, PartenaireRepository } from './PartenaireRepository'
export { structureRepository, StructureRepository } from './StructureRepository'
export { employeRepository, EmployeRepository } from './EmployeRepository'
export { posteRepository, PosteRepository } from './PosteRepository'
export { competenceRepository, CompetenceRepository } from './CompetenceRepository'
export { userRepository, UserRepository } from './UserRepository'
export { configurationRepository, ConfigurationRepository } from './ConfigurationRepository'
export { permissionRepository, PermissionRepository } from './PermissionRepository'
export { BaseRepository } from './BaseRepository'

