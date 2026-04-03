import type { Node, Edge } from '@xyflow/react'

export const urlShortenerNodes: Node[] = [
  {
    id: 'client',
    type: 'component',
    position: { x: 80, y: 280 },
    data: { label: 'Client', nodeId: 'client' },
    draggable: true,
  },
  {
    id: 'load_balancer',
    type: 'component',
    position: { x: 280, y: 280 },
    data: { label: 'Load Balancer', nodeId: 'load_balancer' },
    draggable: true,
  },
  {
    id: 'api_server',
    type: 'component',
    position: { x: 480, y: 280 },
    data: { label: 'API Server', nodeId: 'api_server' },
    draggable: true,
  },
  {
    id: 'cache',
    type: 'component',
    position: { x: 680, y: 160 },
    data: { label: 'Cache', nodeId: 'cache' },
    draggable: true,
  },
  {
    id: 'database',
    type: 'component',
    position: { x: 680, y: 400 },
    data: { label: 'Database', nodeId: 'database' },
    draggable: true,
  },
  {
    id: 'read_replica',
    type: 'component',
    position: { x: 880, y: 400 },
    data: { label: 'Read Replica', nodeId: 'read_replica' },
    draggable: true,
  },
]

export const urlShortenerEdges: Edge[] = [
  {
    id: 'client-load_balancer',
    source: 'client',
    target: 'load_balancer',
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
    id: 'cache-database',
    source: 'cache',
    target: 'database',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'database-read_replica',
    source: 'database',
    target: 'read_replica',
    type: 'health',
    style: { stroke: '#6366f1', strokeWidth: 2 },
    animated: true,
  },
]

export const urlShortenerTemplate = { nodes: urlShortenerNodes, edges: urlShortenerEdges }
