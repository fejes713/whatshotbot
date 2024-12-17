import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ChannelNode({ data }: { data: { onExplore: (channelData: any) => void } }) {
  const [channelData, setChannelData] = useState({
    theme: 'News USA',
    description: 'Channel about crime news in the United States',
    url: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelData({ ...channelData, [e.target.name]: e.target.value })
  }

  const handleExplore = (e: React.FormEvent) => {
    e.preventDefault()
    data.onExplore(channelData)
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Let's explore</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paste">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Enter Details</TabsTrigger>
            <TabsTrigger value="paste">Paste Link</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <form onSubmit={handleExplore} className="space-y-4">
              <Input
                name="theme"
                placeholder="Channel Theme"
                value={channelData.theme}
                onChange={handleInputChange}
              />
              <Input
                name="description"
                placeholder="Brief Description"
                value={channelData.description}
                onChange={handleInputChange}
              />
              <Button type="submit" className="w-full">
                Explore Ideas
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="paste">
            <form onSubmit={handleExplore} className="space-y-4">
              <Input
                name="url"
                placeholder="Paste channel URL"
                value={channelData.url}
                onChange={handleInputChange}
              />
              <Button type="submit" className="w-full">
                Explore Ideas
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Handle type="source" position={Position.Right} />
    </Card>
  )
}
