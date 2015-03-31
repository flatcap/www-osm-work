var busy_count = 0;

function busy (direction)
{
	busy_count += direction;
	if (busy_count < 0) {
		alert ('busy underrun');
		busy_count = 0;
	}

	var t = $('#map')[0];
	if (busy_count > 0) {
		t.style.cursor = 'wait';
	} else {
		t.style.cursor = '';
	}
}

