import type { BaseConfig, BaseStorage, BaseTemplate } from '@/lib/types'
import Inspector from './Inspector'
import cover from './cover.jpeg'
import handlers from './handlers'
import icon from './icon.jpeg'

export interface Config extends BaseConfig {
    discourseLink: string
}

export interface Storage extends BaseStorage {}

export default {
    name: 'Discourse',
    description: 'Create a Frame from a Discourse forum thread.',
    shortDescription: 'Threads as Frames',
    icon: icon,
    octicon: 'people',
    creatorFid: '368382',
    creatorName: 'Chris',
    enabled: true,
    Inspector,
    handlers,
    initialConfig: {},
    cover,
    requiresValidation: false,
    events: [],
} satisfies BaseTemplate
