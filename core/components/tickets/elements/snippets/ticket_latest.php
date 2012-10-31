<?php
$key = md5(json_encode($scriptProperties));
/*
if ($output = $modx->cacheManager->get('tickets/latest.'.$key)) {
	return $output;
}
*/

$action = $modx->getOption('action', $scriptProperties, 'comments');
switch($action) {
	case 'comments':
		if (!isset($scriptProperties['type'])) {$scriptProperties['type'] = 'last';}
		$Comments = $modx->getService('comments','Comments',$modx->getOption('tickets.core_path',null,$modx->getOption('core_path').'components/tickets/').'model/tickets/',$scriptProperties);
		if (!($Comments instanceof Comments)) return '';
		$controller = $Comments->loadController('LatestComments');
		$output = $controller->run($scriptProperties);
	break;

	case 'tickets':
		$Tickets = $modx->getService('tickets','Tickets',$modx->getOption('tickets.core_path',null,$modx->getOption('core_path').'components/tickets/').'model/tickets/',$scriptProperties);
		if (!($Tickets instanceof Tickets)) return '';
		$output = $Tickets->getLatestTickets($scriptProperties);
	break;

	default: $output = '';
}

//$modx->cacheManager->set('tickets/latest.'.$key, $output, 1800);
return $output;