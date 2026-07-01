import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '5yq8ouej',
    dataset: 'production',
  },
  typegen: {
    enabled: true,
    path: '../virtually-built/src/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../virtually-built/sanity.types.ts',
    overloadClientMethods: true,
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
