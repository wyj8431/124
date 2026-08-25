import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const apiSource = await readFile(new URL('../src/api/index.ts', import.meta.url), 'utf8')
const typesSource = await readFile(new URL('../src/types/team.ts', import.meta.url), 'utf8')
const editorSource = await readFile(new URL('../src/pages/DesignEditorPage.tsx', import.meta.url), 'utf8')

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
