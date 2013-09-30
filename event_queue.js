createEventQueue = function () {
	var head = null;

	return {
		insert: function (event) {
			if (!head || head.timestamp > event.timestamp) {
				event.next = head; 
				head = event;
			} else {
				var curr = head;
				while (true) {
					if (!curr.next || curr.next.timestamp > event.timestamp) {
						event.next = curr.next;
						curr.next = event;
						break;
					}
					curr = curr.next;
				}
			} 
		},
		popIfHappened: function (timestamp) {
			if (head && head.timestamp < timestamp) {
				var event = head;
				head = head.next;
				return event;
			}
			return null;
		}
	};		
}
