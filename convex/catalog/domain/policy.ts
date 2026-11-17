import { isAdmin, type Viewer } from "../../identity/domain/viewer";

type OwnedTool = { ownerId: string };

export const canEditTool = (viewer: Viewer, tool: OwnedTool): boolean =>
  tool.ownerId === viewer.id;

export const canRemoveTool = (viewer: Viewer, tool: OwnedTool): boolean =>
  tool.ownerId === viewer.id || isAdmin(viewer);
