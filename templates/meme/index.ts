import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'

export interface Config extends BaseConfig {
    memeUrl: string | undefined
    aspectRatio?: '1.91:1' | '1:1'
    template:
        | {
              id: string
              name: string
              url: string
              captions: string[]
          }
        | undefined
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Meme Creator',
    description: 'Create Memes using Imgflip and share them as a Frame.',
    creatorFid: '260812',
    creatorName: 'Steve',
    cover,
    enabled: true,
    Inspector,
    handlers,
    requiresValidation: false,
    initialConfig: {
        memeUrl: null,
        template: null,
        aspectRatio: '1:1',
    },
    events: [],
} satisfies BaseTemplate
