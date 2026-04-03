import type { Node, Edge } from '@xyflow/react'

export const chatNodes: Node[] = [
  {
    id: 'client',
    type: 'component',
    position: { x: 60, y: 280 },
    data: { label: 'Client', nodeId: 'client' },
    draggable: true,
  },
  {
    id: 'load_balancer',
    type: 'component',
    position: { x: 260, y: 280 },
    data: { label: 'Load Balancer', nodeId: 'load_balancer' },
    draggable: true,
  },
  {
    id: 'rate_limiter',
    type: 'component',
    position: { x: 460, y: 140 },
    data: { label: 'Rate Limiter', nodeId: 'rate_limiter' },
    draggable: true,
  },
  {
    id: 'api_server',
    type: 'component',
    position: { x: 460, y: 280 },
    data: { label: 'API Server', nodeId: 'api_server' },
    draggable: true,
  },
  {
    id: 'cache',
    type: 'component',
    position: { x: 660, y: 140 },
    data: { label: 'Cache', nodeId: 'cache' },
    draggable: true,
  },
  {
    id: 'database',
    type: 'component',
    position: { x: 660, y: 380 },
    data: { label: 'Database', nodeId: 'database' },
    draggable: true,
  },
  {
    id: 'monitoring',
    type: 'component',
    position: { x: 860, y: 280 },
    data: { label: 'Monitoring', nodeId: 'monitoring' },
    draggable: true,
  },
]

export const chatEdges: Edge[] = [
  {
    id: 'client-load_balancer',
    source: 'client',
    target: 'load_balancer',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'load_balancer-rate_limiter',
    source: 'load_balancer',
    target: 'rate_limiter',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'load_balancer-api_server',
    source: 'load_balancer',
    target: 'api_server',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'api_server-cache',
    source: 'api_server',
    target: 'cache',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'api_server-database',
    source: 'api_server',
    target: 'database',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'api_server-monitoring',
    source: 'api_server',
    target: 'monitoring',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'cache-database',
    source: 'cache',
    target: 'database',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
]

export const chatTemplate = { nodes: chatNodes, edges: chatEdges }
