
var sb;
var APP_ID = 'YOUR SENDBIRD APPLICATION HERE';
var USER_ID = 'USER ID HERE';
var ACCESS_TOKEN = null;
var LOGGED_USER;
var CHANNEL_LIST;

/**
 * Connect to Sendbird
 */
function connect(callback) {
    sb = new SendBird({ appId: APP_ID })
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        LOGGED_USER = user;
        callback();
    })
}

/**
 * Show the 3 buttons at the top
 */
function showButtons(privateChannelsEnabled = true, eventsChannels = false, marketingChannel = false) {
    /**
     * Column 1
     */
    const col1 = document.createElement('div');
    col1.classList.add('col', 'text-center');
    const butPrivate = document.createElement('button');
    butPrivate.classList.add('btn', 'h-100', 'w-100');
    if (privateChannelsEnabled) {
        butPrivate.classList.add('btn-primary');
    } else {
        butPrivate.classList.add('btn-secondary');
    }
    butPrivate.innerHTML = 'Private messages';
    butPrivate.addEventListener('click', () => {
        showButtons(true, false, false);
        showPrivateChats();
    })
    col1.appendChild( butPrivate );
    /**
     * Column 2
     */
    const col2 = document.createElement('div');
    col2.classList.add('col', 'text-center');
    const btnEvents = document.createElement('button');
    btnEvents.classList.add('btn', 'h-100', 'w-100');
    if (eventsChannels) {
        btnEvents.classList.add('btn-primary');
    } else {
        btnEvents.classList.add('btn-secondary');
    }
    btnEvents.innerHTML = 'Events';
    btnEvents.addEventListener('click', () => {
        showButtons(false, true, false);
        showEventsChat();
    })
    col2.appendChild( btnEvents );
    /**
     * Column 3
     */
    const col3 = document.createElement('div');
    col3.classList.add('col', 'text-center');
    const btnMarketing = document.createElement('button');
    btnMarketing.classList.add('btn', 'h-100', 'w-100');
    if (marketingChannel) {
        btnMarketing.classList.add('btn-primary');
    } else {
        btnMarketing.classList.add('btn-secondary');
    }
    btnMarketing.innerHTML = 'Marketing';
    btnMarketing.addEventListener('click', () => {
        showButtons(false, false, true);
        showMarketingChat();
    })
    col3.appendChild( btnMarketing );
    /**
     * Add buttons to the UI
     */
    const parent = document.getElementById('parent');
    parent.innerHTML = '';
    parent.appendChild(col1);
    parent.appendChild(col2);
    parent.appendChild(col3);
}

/**
 * Load all channels for this customer
 * (this function loads the first 50 channels only)
 */
function loadMyChannels() {
    var listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.includeEmpty = true;
    listQuery.memberStateFilter = 'joined_only';
    listQuery.order = 'latest_last_message';
    listQuery.limit = 50;
    if (listQuery.hasNext) {
        listQuery.next((groupChannels, error) => {
            CHANNEL_LIST = groupChannels;
        });
    }
}

/**
 * Shows a list of channels if:
 * - Group channels
 * - Not containing customType equals to "EVENT"
 * - Not broadcast channels
 */
function showPrivateChats() {
    if (!CHANNEL_LIST) {
        return;
    }
    const ul = document.getElementById('list');
    ul.innerHTML = '';
    let count = 0;
    for (let ch of CHANNEL_LIST) {
        if (ch.isGroupChannel() && ch.customType != 'EVENT' && !ch.isBroadcast) {
            ul.appendChild( getLI(ch.unreadMessageCount, ch.name, ch.lastMessage, ch.coverUrl, false, () => {
                console.log(ch.name + ' clicked');
            }));
            count ++;
        }
    }
    if (count == 0) {
        ul.appendChild( getLI(null, 'No private chat', '', null, false, () => {
            console.log(ch.name + ' clicked');
        }) );
    }
}

/**
 * Shows a list of channels if:
 * - Group channels
 * - Containing customType equals to "EVENT"
 * - Not broadcast channels
 */
function showEventsChat() {
    if (!CHANNEL_LIST) {
        return;
    }
    const ul = document.getElementById('list');
    ul.innerHTML = '';
    let count = 0;
    for (let ch of CHANNEL_LIST) {
        if (ch.isGroupChannel() && ch.customType == 'EVENT' && !ch.isBroadcast) {
            ul.appendChild( getLI(ch.unreadMessageCount, ch.name, ch.lastMessage, ch.coverUrl, false, () => {
                console.log(ch.name + ' clicked');
            }));
            count ++;
        }
    }
    if (count == 0) {
        ul.appendChild( getLI(null, 'No events', '', null, false, () => {
            console.log(ch.name + ' clicked');
        }) );
    }
}

/**
 * Shows a list of channels if
 * - This is a broadcast channels
 */
function showMarketingChat() {
    if (!CHANNEL_LIST) {
        return;
    }
    const ul = document.getElementById('list');
    ul.innerHTML = '';
    let count = 0;
    for (let ch of CHANNEL_LIST) {
        if (ch.isBroadcast) {
            ul.appendChild( getLI(ch.unreadMessageCount, ch.name, ch.lastMessage, ch.coverUrl, false, () => {
                console.log(ch.name + ' clicked');
            }));
            count ++;
        }
    }
    if (count == 0) {
        ul.appendChild( getLI(null, 'No events', '', null, false, () => {
            console.log(ch.name + ' clicked');
        }) );
    }
}

/**
 * Builds a <li> element and return
 */
function getLI(unreadMessageCount, title, lastMessage, channelImage, selected, callbackClick) {
    const table = document.createElement('table');
    const tBody = document.createElement('tbody');
    const tRow = document.createElement("tr");
    const tdLeft = document.createElement("td");
    const tdCenter = document.createElement("td");
    const tdRight = document.createElement("td");
    const image = document.createElement("img");
    
    table.appendChild(tBody);
    tBody.appendChild(tRow);

    tRow.appendChild(tdLeft);
    tRow.appendChild(tdCenter);
    tRow.appendChild(tdRight);

    table.style.width = '100%';
    tdLeft.style.width = '50px';
    tdRight.style.width = '40px';

    if (channelImage) {
        image.style.height = '40px';
        image.src = channelImage;
        tdLeft.appendChild(image);    
    }

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'pointer');
    if (selected) {
        li.classList.add('active');
    }
    li.appendChild(table);
    li.addEventListener('click', callbackClick);

    const badge = document.createElement('span');
    if (unreadMessageCount) {
        badge.classList.add('badge', 'rounded-pill', 'bg-danger');
        badge.innerHTML = unreadMessageCount;
        li.appendChild(badge);    
    }
    tdRight.appendChild(badge)

    const lastMessageDiv = document.createElement('div');
    if (lastMessage) {
        lastMessageDiv.classList.add('text-muted', 'small');
        lastMessageDiv.innerHTML = lastMessage.message;
    }

    var tdCenterText = document.createTextNode(title);
    tdCenter.appendChild(tdCenterText);
    tdCenter.appendChild( lastMessageDiv );
    
    return li;
}


/**
 * All starts here
 */
connect(() => {
    showButtons();
    loadMyChannels();
})
