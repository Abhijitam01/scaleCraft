import { Handle, Position } from '@xyflow/react'
import { C, NODE_META } from '@/lib/tokens'
import { motion } from 'framer-motion'

export function ComponentNode({ data }: { data: { label: string; nodeId: string } }) {
  const meta = NODE_META[data.nodeId] ?? { icon: '?', color: '#444', sublabel: '' }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-[10px] px-[14px] py-[10px] min-w-[130px] font-mono flex items-center relative"
      style={{
        background: C.bg.node,
        border: `1.5px solid ${meta.color}33`,
      }}
    >
      {/* Input Handle */}
      {data.nodeId !== 'client' && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-[#2a2a2a] !border-2 !border-[#333] !w-3 !h-3 !-left-[7px]"
        />
      )}

      <div className="flex items-center gap-[10px]">
        <div
          className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-[9px] font-bold tracking-widest shrink-0"
          style={{
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}33`,
            color: meta.color,
          }}
        >
          {meta.icon}
        </div>
        <div>
          <div className="text-white text-[12px] font-semibold leading-[1.2] capitalize">
            {data.label}
          </div>
          <div className="text-[#444] text-[10px] mt-[3px]">
            {meta.sublabel}
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[#6366f1] !border-2 !border-[#4f52c9] !w-3 !h-3 !-right-[7px]"
      />
    </motion.div>
  )
}
