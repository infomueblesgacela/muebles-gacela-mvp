import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'SU_PROJECT_ID', // Reemplazar con el ID que obtengas
    dataset: 'production'
  }
})
