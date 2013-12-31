<?php
/**
 * Resolve creating db tables
 *
 * @var xPDOObject $object
 * @var array $options
 */

if ($object->xpdo) {
	/* @var modX $modx */
	$modx =& $object->xpdo;


	switch ($options[xPDOTransport::PACKAGE_ACTION]) {
		case xPDOTransport::ACTION_INSTALL:
			break;

		case xPDOTransport::ACTION_UPGRADE:
			if (!empty($options['chunks']) && !empty($options['update_chunks'])) {
				foreach ($options['update_chunks'] as $v) {

					if (isset($options['chunks'][$v])) {
						$data = $options['chunks'][$v];
						$data['snippet'] = @file_get_contents(MODX_BASE_PATH . $data['static_file']);
						$data['name'] = $v;

						if (!$chunk = $modx->getObject('modChunk', array('name' => $v))) {
							$chunk = $modx->newObject('modChunk');
						}
						$chunk->fromArray($data, '', true, true);
						$chunk->save();
						$modx->log(modX::LOG_LEVEL_INFO, 'Updated chunk "<b>'.$v.'</b>"');
					}
				}
			}
			break;

		case xPDOTransport::ACTION_UNINSTALL:
			break;
	}
}
return true;