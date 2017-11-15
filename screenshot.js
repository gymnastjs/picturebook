import initStoryshots from '@storybook/addon-storyshots'
import params from './params'

initStoryshots({
  framework: 'react',
  configPath: `${params.picturebookPath}/config`,
})
