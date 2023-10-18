import type { AppRecord } from '@vue-devtools-next/schema'
import { DevToolsEvents, callBuffer } from '../../../api'
import { hook } from '../../general/hook'
import { devtoolsContext } from '../../general/state'
import { getAppRecord, getComponentId, getComponentInstance } from '../general'
import { ComponentWalker } from './walker'

export async function getComponentTree(options: { appRecord?: AppRecord; instanceId?: string ;filterText?: string; maxDepth?: number; recursively?: boolean }) {
  const { appRecord = devtoolsContext.appRecord, maxDepth = 100, instanceId = undefined, filterText = '', recursively = false } = options
  const instance = getComponentInstance(appRecord!, instanceId)
  if (instance) {
    // @TODO
    const walker = new ComponentWalker({
      filterText,
      maxDepth,
      recursively,
    })
    return await walker.getComponentTree(instance)
  }
}

export function initComponentTree() {
  hook.on.componentAdded(async (app, uid, parentUid, component) => {
    if (app?._instance?.type?.devtools?.hide)
      return

    if (!app || (typeof uid !== 'number' && !uid) || !component)
      return

    const id = await getComponentId({
      app,
      uid,
      instance: component,
    }) as string
    const appRecord = await getAppRecord(app)

    if (component) {
      if (component.__VUE_DEVTOOLS_UID__ == null)
        component.__VUE_DEVTOOLS_UID__ = id

      if (!appRecord?.instanceMap.has(id))
        appRecord?.instanceMap.set(id, component)
    }

    if (!appRecord)
      return

    const treeNode = await getComponentTree({
      appRecord,
      recursively: false,
    })

    callBuffer(DevToolsEvents.COMPONENT_TREE_UPDATED, treeNode!)
  })

  hook.on.componentUpdated(async (app, uid, parentUid, component) => {
    if (app?._instance?.type?.devtools?.hide)
      return

    if (!app || (typeof uid !== 'number' && !uid) || !component)
      return

    const id = await getComponentId({
      app,
      uid,
      instance: component,
    }) as string
    const appRecord = await getAppRecord(app)

    if (component) {
      if (component.__VUE_DEVTOOLS_UID__ == null)
        component.__VUE_DEVTOOLS_UID__ = id

      if (!appRecord?.instanceMap.has(id))
        appRecord?.instanceMap.set(id, component)
    }

    if (!appRecord)
      return

    const treeNode = await getComponentTree({
      appRecord,
      recursively: false,
    })
    callBuffer(DevToolsEvents.COMPONENT_TREE_UPDATED, treeNode!)
    callBuffer(DevToolsEvents.COMPONENT_STATE_UPDATED, id)
  })

  hook.on.componentRemoved(async (app, uid, parentUid, component) => {
    if (app?._instance?.type?.devtools?.hide)
      return

    if (!app || (typeof uid !== 'number' && !uid) || !component)
      return

    const appRecord = await getAppRecord(app)

    if (!appRecord)
      return

    const id = await getComponentId({
      app,
      uid,
      instance: component,
    }) as string
    appRecord?.instanceMap.delete(id)

    const treeNode = await getComponentTree({
      appRecord,
      recursively: false,
    })

    callBuffer(DevToolsEvents.COMPONENT_TREE_UPDATED, treeNode!)
  })
}