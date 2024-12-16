'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import ReactFlow, { 
  Node, 
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ChannelNode from '@/components/ChannelNode'
import IdeaNode from '@/components/IdeaNode'
import VideoStructureNode from '@/components/VideoStructureNode'

const nodeTypes = {
  channelNode: ChannelNode,
  ideaNode: IdeaNode,
  videoStructureNode: VideoStructureNode,
}

const HORIZONTAL_SPACING = 400
const VERTICAL_SPACING = 375

function ContentIdeaExplorer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingScenes, setLoadingScenes] = useState<string | null>(null)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const generateVideoScenes = (title: string) => {
    return [
      {
        title: 'Introduction',
        duration: '2:00',
        description: 'Set up the context and hook the viewer with an engaging opening.',
      },
      {
        title: 'Main Concept',
        duration: '5:30',
        description: 'Deep dive into the core topic with detailed explanations.',
      },
      {
        title: 'Examples',
        duration: '4:15',
        description: 'Demonstrate practical applications and real-world scenarios.',
      },
      {
        title: 'Advanced Tips',
        duration: '3:45',
        description: 'Share expert insights and professional techniques.',
      },
      {
        title: 'Conclusion',
        duration: '1:45',
        description: 'Summarize key points and provide next steps for viewers.',
      },
    ]
  }

  const exploreIdeasRef = useRef<(channelData: any, sourceNodeId: string) => void>()
  const createVideoStructureRef = useRef<(ideaData: any, sourceNodeId: string) => void>()

  createVideoStructureRef.current = useCallback(async (ideaData: any, sourceNodeId: string) => {
    const sourceNode = nodes.find(node => node.id === sourceNodeId)
    if (!sourceNode) return

    const nodeId = `${sourceNodeId}-video`
    const baseX = sourceNode.position.x + HORIZONTAL_SPACING
    const baseY = sourceNode.position.y

    const newNode: Node = {
      id: nodeId,
      type: 'videoStructureNode',
      position: { x: baseX, y: baseY },
      data: {
        title: ideaData.title,
        description: ideaData.description,
        scenes: [],
        isLoading: true,
        onRegenerate: () => regenerateScenesRef.current?.(ideaData, nodeId),
      },
    }

    setNodes((nds) => [...nds, newNode])
    setLoadingScenes(nodeId)

    try {
      const response = await fetch('/api/generate-scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaData),
      })
      
      if (!response.ok) throw new Error('Failed to generate scenes')
      
      const scenes = await response.json()

      setNodes((nds) => nds.map((node) => 
        node.id === nodeId 
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                scenes,
                isLoading: false,
                onRegenerate: () => regenerateScenesRef.current?.(ideaData, nodeId),
              } 
            }
          : node
      ))
    } catch (error) {
      console.error('Error generating scenes:', error)
    } finally {
      setLoadingScenes(null)
    }

    const newEdge: Edge = {
      id: `${sourceNodeId}-${nodeId}`,
      source: sourceNodeId,
      target: nodeId,
      type: 'smoothstep',
    }

    setEdges((eds) => [...eds, newEdge])
    setTimeout(() => fitView({ padding: 0.2 }), 0)
  }, [nodes, setNodes, setEdges, fitView])

  exploreIdeasRef.current = useCallback(async (channelData: any, sourceNodeId: string) => {
    const sourceNode = nodes.find(node => node.id === sourceNodeId)
    if (!sourceNode) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
      })
      
      if (!response.ok) throw new Error('Failed to generate ideas')
      
      const ideas = await response.json()
      
      const baseX = sourceNode.position.x + HORIZONTAL_SPACING
      const baseY = sourceNode.position.y - ((ideas.length - 1) * VERTICAL_SPACING) / 2

      const newNodes: Node[] = ideas.map((idea, index) => ({
        id: `${sourceNodeId}-idea-${index}`,
        type: 'ideaNode',
        position: { x: baseX, y: baseY + index * VERTICAL_SPACING },
        data: { 
          ...idea, 
          onExplore: (ideaData: any) => exploreIdeasRef.current?.({
            ...ideaData,
            type: 'explore_further'
          }, `${sourceNodeId}-idea-${index}`),
          onCreate: () => createVideoStructureRef.current?.(idea, `${sourceNodeId}-idea-${index}`),
        },
      }))

      const newEdges: Edge[] = newNodes.map((node) => ({
        id: `${sourceNodeId}-${node.id}`,
        source: sourceNodeId,
        target: node.id,
        type: 'smoothstep',
      }))

      setNodes((nds) => [...nds, ...newNodes])
      setEdges((eds) => [...eds, ...newEdges])
      setTimeout(() => fitView({ padding: 0.2 }), 0)
    } catch (error) {
      console.error('Error generating ideas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [nodes, setNodes, setEdges, fitView])

  const addChannelNode = useCallback(() => {
    const newNode: Node = {
      id: 'channel',
      type: 'channelNode',
      position: { x: 0, y: 0 },
      data: { 
        onExplore: (channelData: any) => exploreIdeasRef.current?.({
          ...channelData,
          type: 'initial'
        }, 'channel') 
      },
    }
    setNodes([newNode])
  }, [setNodes])

  useEffect(() => {
    addChannelNode()
  }, [addChannelNode])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}

export default function ContentIdeaExplorerWrapper() {
  return (
    <ReactFlowProvider>
      <ContentIdeaExplorer />
    </ReactFlowProvider>
  )
}

