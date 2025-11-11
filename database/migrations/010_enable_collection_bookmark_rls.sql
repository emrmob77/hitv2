-- Enable RLS on collection_bookmarks
ALTER TABLE collection_bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow owners and collaborators to read collection bookmarks
CREATE POLICY collection_bookmarks_select_policy
ON collection_bookmarks
FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  OR EXISTS (
    SELECT 1
    FROM collection_collaborators cc
    WHERE
      cc.collection_id = collection_bookmarks.collection_id
      AND cc.user_id = auth.uid()
  )
);

-- Allow owners and editors to update or delete existing bookmarks (includes reordering)
CREATE POLICY collection_bookmarks_modify_policy
ON collection_bookmarks
FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  OR EXISTS (
    SELECT 1
    FROM collection_collaborators cc
    WHERE
      cc.collection_id = collection_bookmarks.collection_id
      AND cc.user_id = auth.uid()
      AND cc.role IN ('owner', 'editor')
  )
)
WITH CHECK (
  auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  OR EXISTS (
    SELECT 1
    FROM collection_collaborators cc
    WHERE
      cc.collection_id = collection_bookmarks.collection_id
      AND cc.user_id = auth.uid()
      AND cc.role IN ('owner', 'editor')
  )
);

-- Allow owners and editors to delete bookmarks from the collection
CREATE POLICY collection_bookmarks_delete_policy
ON collection_bookmarks
FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  OR EXISTS (
    SELECT 1
    FROM collection_collaborators cc
    WHERE
      cc.collection_id = collection_bookmarks.collection_id
      AND cc.user_id = auth.uid()
      AND cc.role IN ('owner', 'editor')
  )
);

-- Allow owners, editors, and contributors to add bookmarks
CREATE POLICY collection_bookmarks_insert_policy
ON collection_bookmarks
FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM collections WHERE id = collection_id)
  OR EXISTS (
    SELECT 1
    FROM collection_collaborators cc
    WHERE
      cc.collection_id = collection_bookmarks.collection_id
      AND cc.user_id = auth.uid()
      AND cc.role IN ('owner', 'editor', 'contributor')
  )
);
