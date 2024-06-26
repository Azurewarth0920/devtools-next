import presetIcons from '@unocss/preset-icons/browser'
import init from '@unocss/runtime'

init({
  defaults: {
    presets: [
      presetIcons({
        prefix: ['i-', ''],
        collections: {},
        scale: 1.2,
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
  },
  bypassDefined: true,
})
