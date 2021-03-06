<?php
class TicketThread extends xPDOSimpleObject {


	public function getCommentsCount() {
		return $this->get('comments');
	}


	public function updateLastComment() {
		$q = $this->xpdo->newQuery('TicketComment', array('thread' => $this->id, 'published' => 1, 'deleted' => 0));
		$q->sortby('createdon','DESC');
		$q->limit(1);
		$q->select('id as comment_last,createdon as comment_time');
		if ($q->prepare() && $q->stmt->execute()) {
			$comment = $q->stmt->fetch(PDO::FETCH_ASSOC);
			if (empty($comment)) {
				$comment = array('comment_last' => 0, 'comment_time' => 0);
			}
			$this->fromArray($comment);
			$this->save();
		}

		$this->updateCommentsCount();
	}


	public function updateCommentsCount() {
		$comments = 0;
		$q = $this->xpdo->newQuery('TicketComment', array('thread' => $this->id, 'published' => 1));
		$q->select('COUNT(`id`)');
		if ($q->prepare() && $q->stmt->execute()) {
			$comments = $q->stmt->fetch(PDO::FETCH_COLUMN);
			$this->set('comments', $comments);
			$this->save();
		}

		return $comments;
	}


	public function buildTree($comments = array(), $depth = 0) {
		// Thank to Agel_Nash for the idea about how to limit comments by depth
		$tree = array();
		foreach ($comments as $id => &$row) {
			$row['has_children'] = $row['level'] = 0;

			if (empty($row['parent'])) {
				$tree[$id] = &$row;
			}
			else {
				$parent = $row['parent'];
				$level = $comments[$parent]['level'];
				$comments[$parent]['has_children'] = 1;

				if (!empty($depth) && $level >= $depth) {
					$parent = $comments[$parent]['new_parent'];
					$row['new_parent'] = $parent;
					$row['level'] = $level;
				}
				else {
					$row['level'] = $level + 1;
				}

				$comments[$parent]['children'][$id] = &$row;
			}
		}
		return $tree;
	}


	public function Subscribe($uid = 0) {
		if (!$uid) {$uid = $this->xpdo->user->id;}

		$subscribers = $this->get('subscribers');
		if (empty($subscribers) || !is_array($subscribers)) {
			$subscribers = array();
		}

		$found = array_search($uid, $subscribers);
		if ($found === false) {
			$subscribers[] = $uid;
		}
		else {
			unset($subscribers[$found]);
		}
		$this->set('subscribers', array_values($subscribers));
		$this->save();

		return ($found === false);
	}


	public function isSubscribed($uid = 0) {
		if (!$uid) {$uid = $this->xpdo->user->id;}

		$subscribers = $this->get('subscribers');
		if (empty($subscribers) || !is_array($subscribers)) {
			$subscribers = array();
		}

		return in_array($uid, $subscribers);
	}
}