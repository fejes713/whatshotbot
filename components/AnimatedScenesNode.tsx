import { Handle, Position } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface AnimatedScene {
  imageUrl: string
  prompt: string
  animatedUrl?: string
}

interface AnimatedScenesNodeProps {
  data: {
    title: string
    description: string
    scenes: AnimatedScene[]
    isLoading: boolean
  }
}

export default function AnimatedScenesNode({ data }: AnimatedScenesNodeProps) {
  const [editedPrompts, setEditedPrompts] = useState<{ [key: number]: string }>({})
  const [regeneratingIndices, setRegeneratingIndices] = useState<number[]>([])

  const handlePromptChange = (index: number, newPrompt: string) => {
    setEditedPrompts(prev => ({
      ...prev,
      [index]: newPrompt
    }))
  }

  const handleRegenerate = async (index: number) => {
    const newPrompt = editedPrompts[index]
    if (!newPrompt) return

    setRegeneratingIndices(prev => [...prev, index])

    try {
      const response = await fetch('/api/generate-animations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: newPrompt,
          aspect_ratio: "16:9"
        }),
      })

      if (!response.ok) throw new Error('Failed to regenerate animation')
      
      const { animatedUrl } = await response.json()
      
      // Update the scene with new animation
      data.scenes[index] = {
        ...data.scenes[index],
        prompt: newPrompt,
        animatedUrl
      }

      // Clear the edited prompt since it's now the current one
      setEditedPrompts(prev => {
        const { [index]: _, ...rest } = prev
        return rest
      })
    } catch (error) {
      console.error('Error regenerating animation:', error)
    } finally {
      setRegeneratingIndices(prev => prev.filter(i => i !== index))
    }
  }

  if (data.isLoading) {
    return (
      <Card className="w-[1200px]">
        <CardHeader>
          <CardTitle className="text-xl">{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Generating animations...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[1200px]">
      <CardHeader>
        <CardTitle className="text-xl">{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {data.scenes.map((scene, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {regeneratingIndices.includes(index) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-pulse">Regenerating...</div>
                    </div>
                  ) : (
                    <img 
                      src={scene.animatedUrl || scene.imageUrl} 
                      alt={`Scene ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={editedPrompts[index] || scene.prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    className="min-h-[100px] text-sm resize-none"
                    placeholder="Enter your prompt here..."
                  />
                  {editedPrompts[index] !== undefined && editedPrompts[index] !== scene.prompt && (
                    <Button 
                      onClick={() => handleRegenerate(index)} 
                      size="sm" 
                      className="w-full"
                      disabled={regeneratingIndices.includes(index)}
                    >
                      <RefreshCcw className={`w-3 h-3 mr-2 ${
                        regeneratingIndices.includes(index) ? 'animate-spin' : ''
                      }`} />
                      {regeneratingIndices.includes(index) ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button onClick={() => window.open('https://www.veed.io', '_blank')} className="w-48">
              <ExternalLink className="w-4 h-4 mr-2" />
              Take me to Veed
            </Button>
          </div>
        </div>
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  )
} 