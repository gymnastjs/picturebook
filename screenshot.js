import initStoryshots from '@storybook/addon-storyshots'
import { picturebookPath } from './params'

initStoryshots({
  framework: 'react',
  configPath: `${picturebookPath}/config`,
})
