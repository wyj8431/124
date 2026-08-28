import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const apiSource = await readFile(new URL('../src/api/index.ts', import.meta.url), 'utf8')
const typesSource = await readFile(new URL('../src/types/team.ts', import.meta.url), 'utf8')
const editorSource = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')
const addPanelSource = await readFile(new URL('../src/components/editor/EditorAddPanel.tsx', import.meta.url), 'utf8')
const addPanelCatalogSource = await readFile(new URL('../src/modules/editor/addPanelCatalog.mjs', import.meta.url), 'utf8')
const editorStyles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const shareServiceSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/service/DesignShareService.java', import.meta.url), 'utf8')
const eventControllerSource = await readFile(new URL('../../backend/src/main/java/com/chuangkit/admin/controller/CollaborationEventController.java', import.meta.url), 'utf8')

test('exposes team collaboration API operations and response types', () => {
  assert.match(typesSource, /export interface TeamPresence/)
  assert.match(typesSource, /export interface TeamComment/)
  assert.match(typesSource, /export interface TeamVersion/)
  assert.match(apiSource, /updatePresence:/)
  assert.match(apiSource, /getComments:/)
  assert.match(apiSource, /addComment:/)
  assert.match(apiSource, /removeComment:/)
  assert.match(apiSource, /getVersions:/)
  assert.match(apiSource, /createVersion:/)
})

test('editor reports presence and exposes comments and version history', () => {
  assert.match(editorSource, /teamApi\.getCurrent/)
  assert.match(editorSource, /teamApi\.updatePresence/)
  assert.match(editorSource, /window\.setInterval/)
  assert.match(editorSource, /teamApi\.addComment/)
  assert.match(editorSource, /parentId: replyToCommentId/)
  assert.match(editorSource, /取消回复/)
  assert.match(editorSource, /回复这条评论/)
  assert.match(editorSource, /replyTarget/)
  assert.match(editorSource, /评论已发布，但协作信息刷新失败/)
  assert.match(editorSource, /teamApi\.removeComment/)
  assert.match(editorSource, /teamApi\.createVersion/)
  assert.match(editorSource, /window\.confirm/)
  assert.match(editorSource, /JSON\.parse\(version\.canvasJson\)/)
})

test('editor sends a revision and pauses autosave after a save conflict', () => {
  assert.match(apiSource, /revision\?: number/)
  assert.match(editorSource, /revision: revision/)
  assert.match(editorSource, /saveConflict/)
  assert.match(editorSource, /409/)
  assert.match(editorSource, /重新加载最新版本/)
})

test('editor polls for newer remote revisions without replacing the local draft', () => {
  assert.match(editorSource, /remoteUpdateAvailable/)
  assert.match(editorSource, /remoteRevision/)
  assert.match(editorSource, /setInterval\(checkForRemoteChanges, 15_000\)/)
  assert.match(editorSource, /其他成员已更新这个设计/)
  assert.match(editorSource, /稍后处理/)
})

test('editor matches the reference workbench structure', () => {
  assert.match(editorSource, /design-editor-tool-panel/)
  assert.match(editorSource, /design-editor-topbar-start/)
  assert.match(editorSource, /design-editor-file-menu/)
  assert.match(editorSource, /shareDesign/)
  assert.match(editorSource, /<EditorAddPanel/)
  assert.match(addPanelSource, /editorAddPanelSections/)
  assert.match(addPanelCatalogSource, /本地上传/)
  assert.match(editorSource, /保存快照/)
})

test('editor exposes the Figma workbench surface and dense material controls', () => {
  assert.match(editorSource, /design-editor-shell--figma/)
  assert.match(editorSource, /data-editor-visual="figma-workbench"/)
  assert.match(editorSource, /design-editor-asset-filter-grid/)
  assert.match(editorSource, /AI做同款/)
  assert.match(editorStyles, /\.design-editor-shell--figma/)
  assert.match(editorStyles, /\.design-editor-asset-filter-grid/)
  assert.match(editorStyles, /--editor-canvas-bg/)
})

test('editor starts in the same open-panel state as the reference workbench', () => {
  assert.match(editorSource, /useState<[^>]+>\('add'\)/)
  assert.match(editorSource, /const \[inspectorOpen, setInspectorOpen\] = useState\(true\)/)
  assert.match(editorSource, /design-editor-canvas-placeholder/)
  assert.match(editorSource, /双击编辑文字/)
  assert.match(editorStyles, /design-editor-shell--figma \.design-editor-canvas-placeholder/)
})

test('editor exposes a development-only authenticated preview path for visual QA', () => {
  assert.match(editorSource, /import\.meta\.env\.DEV/)
  assert.match(editorSource, /preview.*=== '1'/)
  assert.match(editorSource, /login\('demo', '123456'\)/)
  assert.match(editorSource, /!isLoggedIn && !isDevPreview/)
})

test('share links are server-issued capabilities and public resolution is mode-aware', () => {
  assert.match(apiSource, /designShareApi/)
  assert.match(editorSource, /shareToken/)
  assert.match(editorSource, /designShareApi\.resolve/)
  assert.match(shareServiceSource, /SecureRandom/)
  assert.match(shareServiceSource, /getRevoked|setRevoked/)
  assert.match(shareServiceSource, /getExpireTime|setExpireTime/)
  assert.match(eventControllerSource, /MediaType\.TEXT_EVENT_STREAM_VALUE/)
  assert.match(eventControllerSource, /eventBroker\.publish/)
})
