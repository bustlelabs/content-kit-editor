import { forEach, ForEachable, HasLength } from './array-utils'
import assert from './assert'
import { Type } from '../models/types'
import Post from '../models/post'
import Image from '../models/image'
import ListSection from '../models/list-section'
import MarkupSection from '../models/markup-section'
import ListItem from '../models/list-item'
import Card from '../models/card'
import Marker from '../models/marker'
import Markup from '../models/markup'

export type Opcode = [string] | [string, unknown] | [string, unknown, unknown]
export type Opcodes = Opcode[]

interface Visitor {
  [Type.POST]: (node: Post, opcodes: Opcodes) => void
  [Type.MARKUP_SECTION]: (node: MarkupSection, opcodes: Opcodes) => void
  [Type.LIST_SECTION]: (node: ListSection, opcodes: Opcodes) => void
  [Type.LIST_ITEM]: (node: ListItem, opcodes: Opcodes) => void
  [Type.IMAGE_SECTION]: (node: Image, opcodes: Opcodes) => void
  [Type.CARD]: (node: Card, opcodes: Opcodes) => void
  [Type.MARKER]: (node: Marker, opcodes: Opcodes) => void
  [Type.MARKUP]: (node: Markup, opcodes: Opcodes) => void
}

interface CompileNode {
  type: string
}

export function visit(visitor: Visitor, node: CompileNode, opcodes: Opcodes) {
  const method = node.type
  assert(`Cannot visit unknown type ${method}`, !!visitor[method])
  visitor[method](node, opcodes)
}

interface Compiler {
  [key: string]: (...args: unknown[]) => void
}

export function compile(compiler: Compiler, opcodes: Opcodes) {
  for (var i = 0, l = opcodes.length; i < l; i++) {
    let [method, ...params] = opcodes[i]
    let length = params.length
    if (length === 0) {
      compiler[method].call(compiler)
    } else if (length === 1) {
      compiler[method].call(compiler, params[0])
    } else if (length === 2) {
      compiler[method].call(compiler, params[0], params[1])
    } else {
      compiler[method].apply(compiler, params)
    }
  }
}

type CompileNodes = ForEachable<CompileNode> & HasLength<CompileNode>

export function visitArray(visitor: Visitor, nodes: CompileNodes, opcodes: Opcodes) {
  if (!nodes || nodes.length === 0) {
    return
  }
  forEach(nodes, node => {
    visit(visitor, node, opcodes)
  })
}
