import {useEffect, useState} from 'react'
import {useClient, type PreviewProps} from 'sanity'

type TranscriptEntryPreviewProps = PreviewProps & {
  start?: number
  text?: string
  speaker?: {
    _ref?: string
  }
}

const formatTimestamp = (start: number | undefined) => {
  if (typeof start !== 'number') {
    return '00:00'
  }

  return `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
}

export const TranscriptEntryPreview = (props: TranscriptEntryPreviewProps) => {
  const {renderDefault, start, text, speaker} = props
  const client = useClient({apiVersion: '2025-08-15'})
  const [speakerName, setSpeakerName] = useState<string>()

  useEffect(() => {
    const ref = speaker?._ref

    if (!ref) {
      setSpeakerName(undefined)
      return
    }

    let cancelled = false

    client.fetch<string | null>(`*[_id == $id][0].name`, {id: ref}).then((name) => {
      if (!cancelled) {
        setSpeakerName(name ?? undefined)
      }
    })

    return () => {
      cancelled = true
    }
  }, [client, speaker?._ref])

  return renderDefault({
    ...props,
    title: `${formatTimestamp(start)} · ${speakerName ?? 'Unknown'}`,
    subtitle: typeof text === 'string' ? text.slice(0, 80) : undefined,
  })
}
