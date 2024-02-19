import { root } from "./elements.js";
import { currentUser } from "../controller/firebase_auth.js";
import { DEV } from "../model/constants.js";
import { getThreadById } from "../controller/firestore_controller.js";
import { onSubmitAddReply } from "../controller/thread_controller.js";
import { protectedView } from "./protected_view.js"; // Added import statement
import { getReplyList } from "../controller/firestore_controller.js";
import { Reply } from "../model/Reply.js"; // Added import statement for Reply class

export async function threadPageView(threadId){
    if (!currentUser) {
        root.innerHTML = await protectedView();
        return;
    }

    const response = await fetch('./view/templates/thread_page_template.html',
        { cache: 'no-store' });
    const divWrapper = document.createElement('div');
    divWrapper.innerHTML = await response.text();
    divWrapper.classList.add('m-4', 'p-4');

    let thread;
    let replyList;
    try {
        thread = await getThreadById(threadId);
        if (!thread) throw 'Thread not exists by id: ' + threadId;
        replyList = await getReplyList(thread.docId);
    } catch (e) {
        if(DEV) console.log('Failed to load thread/replies',e);
        alert('Failed to load a thread/replies' + JSON.stringify(e));
        return;
    }

    // display the message thread
    divWrapper.querySelector('#message-title').textContent = thread.title;
    divWrapper.querySelector('#message-email-timestamp').innerHTML = 
    `${thread.email}<br>${new Date(thread.timestamp).toLocaleString()}`;
    divWrapper.querySelector('#message-content').textContent = thread.content;

    // display the replies to this thread
    const tbody = divWrapper.querySelector('#reply-tbody');
    replyList.forEach(reply => {
        const tr = createReplyView(reply);
        tbody.appendChild(tr);
    })

    // form to add new reply
    const formAddReply = divWrapper.querySelector('#form-add-reply');
    const replyAddButton = formAddReply.querySelector('button');
    replyAddButton.id = threadId;
    replyAddButton.value = thread.uid; // thread owner's uid
    formAddReply.onsubmit = onSubmitAddReply;

    root.innerHTML = '';
    root.appendChild(divWrapper);
}

function createReplyView(reply){
    const tr = document.createElement('tr');
    tr.classList.add('mt-3', 'pt-3');
    const tdContent = document.createElement('td');
    tdContent.innerHTML = reply.content;

    const tdEmailTimestamp = document.createElement('td');
    tdEmailTimestamp.innerHTML = `
    ${reply.email}<br>(${new Date(reply.timestamp).toLocaleString()})
    `;
    tr.appendChild(tdContent);
    tr.appendChild(tdEmailTimestamp);
    return tr;
}