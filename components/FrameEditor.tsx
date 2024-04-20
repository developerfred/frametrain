'use client'
import { useRefreshPreview } from '@/components/editor/useRefreshPreview'
import type { frameTable } from '@/db/schema'
import { updateFrameConfig, updateFrameName } from '@/lib/actions'
import type templates from '@/templates'
import type { InferSelectModel } from 'drizzle-orm'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Copy } from 'react-feather'
import { toast } from 'react-hot-toast'
import { useDebouncedCallback } from 'use-debounce'
import { FramePreview } from './FramePreview'
import { InspectorContext } from './editor/Context'
import { Button } from './shadcn/Button'
import { Input } from './shadcn/Input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './shadcn/Tooltip'


export default function FrameEditor({
    frame,
    template,
}: {
    frame: InferSelectModel<typeof frameTable>
    template: (typeof templates)[keyof typeof templates]
}) {
    const [frameConfig, setFrameConfig] = useState(frame.config as typeof template.initialConfig)

    const [name, setName] = useState(frame.name)
    const [editingName, setEditingName] = useState(false)
    const [temporaryName, setTemporaryName] = useState(frame.name)

    const [updating, setUpdating] = useState(false)

    const refreshPreview = useRefreshPreview()

    async function updateConfig(props: Record<string, any>) {
        if (!frameConfig) {
            alert('No config')
            return
        }

        setUpdating(true)

        const newConfig = Object.assign({}, frameConfig, props)

        setFrameConfig(newConfig)

        await updateFrameConfig(frame.id, newConfig)

        refreshPreview(`${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`)

        setUpdating(false)
    }

    const debouncedUpdateConfig = useDebouncedCallback((value: Record<string, any>) => {
        updateConfig(value)
    }, 1000)

    async function updateName() {
        setUpdating(true)
        await updateFrameName(frame.id, temporaryName)
        setEditingName(false)
        setName(temporaryName)
        setUpdating(false)
        if (document) {
            document.title = `${temporaryName} | FrameTrain`
        }
    }

    async function handleEnter(e: KeyboardEvent) {
        if (!editingName) return

        if (e.key === 'Enter') {
            e.preventDefault()
            await updateName()
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleEnter)

        return () => {
            window.removeEventListener('keydown', handleEnter)
        }
    })

    useEffect(() => {
        refreshPreview(`${process.env.NEXT_PUBLIC_HOST}/f/${frame.id}`)
    }, [frame, refreshPreview])

    const { Inspector } = template as any

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center p-4 bg-secondary-background">
                <div className="flex gap-4 items-center">
                    <NextLink style={{ textDecoration: 'none' }} href={'/'}>
                        <div className="p-2 hover:bg-[#636b74] rounded-md">
                            <ArrowLeft />
                        </div>
                    </NextLink>
                    {editingName ? (
                        <Input
                            value={temporaryName}
                            onChange={(e) => setTemporaryName(e.target.value)}
                            onKeyDown={handleEnter}
                            className="text-4xl font-bold focus:bg-transparent hover:bg-transparent"
                        />
                    ) : (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger>
                                    <h1
                                        className="text-4xl font-bold cursor-pointer"
                                        onClick={() => setEditingName(true)}
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                setEditingName(true)
                                            }
                                        }}
                                    >
                                        {name}
                                    </h1>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-72 ml-8">
                                    <p>Tap to edit the title, press enter to save.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <div className="flex flex-row items-center space-x-4">
                    {updating && (
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500 animate-spin border-r-transparent" />
                    )}

                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    size={'lg'}
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            `https://frametra.in/f/${frame.id}`
                                        )
                                        toast.success('Copied to clipboard!')
                                    }}
                                    className="gap-4 px-6 py-3 bg-transparent rounded-md border border-border text-primary hover:bg-secondary-border"
                                >
                                    <span className="text-base">URL</span> <Copy size={18} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-72 mr-8">
                                <p>Copies the shareable Frame URL to your clipboard.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="flex flex-col md:flex-row  bg-secondary-background w-full h-full bg-[url('/dots.svg')]">
                <div className="flex flex-col justify-center items-center px-12 py-6 w-full md:w-3/5">
                    <FramePreview />
                </div>
                <div className="overflow-y-scroll p-6 w-full h-full bg-black md:w-2/5">
                    <h1 className="mb-4 text-4xl font-bold">Configuration</h1>
                    <div className="pt-5 pb-10">
                        <InspectorContext.Provider
                            value={{
                                frameId: frame.id,
                                config: frameConfig,
                                update: debouncedUpdateConfig,
                            }}
                        >
                            <Inspector
                                config={frameConfig}
                                update={(value: Record<string, any>) =>
                                    debouncedUpdateConfig(value)
                                }
                            />
                        </InspectorContext.Provider>
                    </div>
                    {/* {template.requiresValidation && <MockOptionsToggle />} */}
                </div>
            </div>
        </div>
    )
}
