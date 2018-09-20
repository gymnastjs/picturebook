const React = require('react')
const { linkTo } = require('@storybook/addon-links')

module.exports = () => <button type="button" onClick={linkTo('subFolder', 'File3')}>I use links to go to the next story!</button>
