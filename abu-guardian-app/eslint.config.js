import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    files: ['**/*.{js,mjs,jsx,vue}'],
    languageOptions: {
      globals: {
        // globals del navegador
        ...globals.browser,
        // globals de MediaPipe.
        'Pose': 'readonly',
        'Camera': 'readonly',
        'drawConnectors': 'readonly',
        'drawLandmarks': 'readonly',
        'POSE_CONNECTIONS': 'readonly'
      }
    },
  },

  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
]
