import { Handle, Position } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RefreshCcw, ExternalLink } from 'lucide-react'

interface VideoScene {
  title: string
  duration: string
  description: string
}

interface VideoStructureNodeProps {
  data: {
    title: string
    description: string
    scenes: VideoScene[]
    onRegenerate: () => void
    isLoading: boolean
  }
}

export default function VideoStructureNode({ data }: VideoStructureNodeProps) {
  const totalDuration = data.scenes.reduce((acc, scene) => {
    const [mins, secs] = scene.duration.split(':').map(Number)
    return acc + mins * 60 + secs
  }, 0)

  const formatTotalDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (data.isLoading) {
    return (
      <Card className="w-[600px]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{data.title}</CardTitle>
              <CardDescription className="mt-2">{data.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin">
              <RefreshCcw className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground">Generating scenes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{data.title}</CardTitle>
            <CardDescription className="mt-2">{data.description}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Duration: {formatTotalDuration(totalDuration)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            {data.scenes.map((scene, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="w-32 aspect-video bg-muted rounded-md flex items-center justify-center">
                  Scene {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{scene.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{scene.description}</p>
                </div>
                <div className="text-sm font-medium tabular-nums">
                  {scene.duration}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <Button onClick={data.onRegenerate} variant="outline" className="flex-1">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={() => window.open('https://www.veed.io', '_blank')} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Start Editing
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  )
}

