'use client'

import { useEffect, useCallback, useRef } from 'react'
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

  createVideoStructureRef.current = useCallback((ideaData: any, sourceNodeId: string) => {
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
        scenes: generateVideoScenes(ideaData.title),
        onRegenerate: () => {
          setNodes((nds) => nds.map((node) => 
            node.id === nodeId 
              ? { ...node, data: { ...node.data, scenes: generateVideoScenes(ideaData.title) } }
              : node
          ))
        },
      },
    }

    const newEdge: Edge = {
      id: `${sourceNodeId}-${nodeId}`,
      source: sourceNodeId,
      target: nodeId,
      type: 'smoothstep',
    }

    setNodes((nds) => [...nds, newNode])
    setEdges((eds) => [...eds, newEdge])
    setTimeout(() => fitView({ padding: 0.2 }), 0)
  }, [nodes, setNodes, setEdges, fitView])

  exploreIdeasRef.current = useCallback((channelData: any, sourceNodeId: string) => {
    const ideas = generateIdeas(channelData)
    const sourceNode = nodes.find(node => node.id === sourceNodeId)
    if (!sourceNode) return

    const baseX = sourceNode.position.x + HORIZONTAL_SPACING
    const baseY = sourceNode.position.y - ((ideas.length - 1) * VERTICAL_SPACING) / 2

    const newNodes: Node[] = ideas.map((idea, index) => ({
      id: `${sourceNodeId}-idea-${index}`,
      type: 'ideaNode',
      position: { x: baseX, y: baseY + index * VERTICAL_SPACING },
      data: { 
        ...idea, 
        onExplore: (ideaData: any) => exploreIdeasRef.current?.(ideaData, `${sourceNodeId}-idea-${index}`),
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
  }, [nodes, setNodes, setEdges, fitView])

  const addChannelNode = useCallback(() => {
    const newNode: Node = {
      id: 'channel',
      type: 'channelNode',
      position: { x: 0, y: 0 },
      data: { onExplore: (channelData: any) => exploreIdeasRef.current?.(channelData, 'channel') },
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

function generateIdeas(channelData: any) {
  return Array(3).fill(null).map((_, i) => ({
    title: `Exciting Video Idea ${i + 1}`,
    description: `This is a brief description of video idea ${i + 1}. It includes some details about the content and potential audience engagement.`,
  }))
}

export default function ContentIdeaExplorerWrapper() {
  return (
    <ReactFlowProvider>
      <ContentIdeaExplorer />
    </ReactFlowProvider>
  )
}

