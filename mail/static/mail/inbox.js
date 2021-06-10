document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#load-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

    document.querySelector('#compose-form').onsubmit = function() {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
        })
      })
      .then(response => response.json())
      .then(result => {
        //print result
        console.log(result);
      });
    }

}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#load-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-name').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //print emails
    console.log(emails);

    var counter = 0;

    while (document.getElementById("emailposting")) {
      var myobj = document.getElementById("emailposting");
      myobj.remove();
    }

    emails.forEach(function(email) {
          const emailposting = document.createElement('div');
          emailposting.className = `emailposting${counter}`;
          emailposting.id = "emailposting";
          emailposting.onclick = function() { load_email(mailbox, email.id); }
          document.querySelector("#emails-list").append(emailposting);

          const listitemsender = document.createElement('div');
          listitemsender.className = `listitemsender${counter}`;
          listitemsender.id = "listitemsender";
          listitemsender.innerHTML = `${email.sender}`;
          document.querySelector(`.emailposting${counter}`).append(listitemsender);

          const listitemsubject = document.createElement('div');
          listitemsubject.className = `listitemsubject${counter}`;
          listitemsubject.id = "listitemsubject";
          listitemsubject.innerHTML = `${email.subject}`;
          document.querySelector(`.emailposting${counter}`).append(listitemsubject);

          const listitemtimestamp = document.createElement('div');
          listitemtimestamp.className = `listitemtimestamp${counter}`;
          listitemtimestamp.id = "listitemtimestamp";
          listitemtimestamp.innerHTML = `${email.timestamp}`;
          document.querySelector(`.emailposting${counter}`).append(listitemtimestamp);

          if(mailbox !== 'sent') {
            if(email.read == true) {
              document.getElementsByClassName(`emailposting${counter}`)[0].style.backgroundColor = 'gray';
            }
          }

          counter++;

    })

  })

}

function load_email(mailbox, email_id) {
  document.querySelector('#load-email').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    //print email
    console.log(email);

    if (document.getElementById("emaillayout")) {
      var myobj = document.getElementById("emaillayout");
      myobj.remove();
    }

    const emaillayout = document.createElement('div');
    emaillayout.id = "emaillayout";
    document.querySelector("#load-email").append(emaillayout);

    const from = document.createElement('div');
    from.id = "from";
    from.innerHTML = `From: ${email.sender}`;
    document.querySelector("#emaillayout").append(from);

    const to = document.createElement('div');
    to.id = "to";
    to.innerHTML = `To: ${email.recipients}`;
    document.querySelector("#emaillayout").append(to);

    const subject = document.createElement('div');
    subject.id = "subject";
    subject.innerHTML = `Subject: ${email.subject}`;
    document.querySelector("#emaillayout").append(subject);

    const timestamp = document.createElement('div');
    timestamp.id = "timestamp";
    timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
    document.querySelector("#emaillayout").append(timestamp);

    const reply = document.createElement('button');
    reply.className = "btn btn-sm btn-outline-primary";
    reply.id = "reply";
    reply.innerHTML = "Reply";
    reply.onclick = function() {
      compose_email()
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    }
    document.querySelector("#emaillayout").append(reply);



    //Archive Email or Move Email to Inbox
    if (mailbox !== 'sent') {
      if(email.archived === false) {
        const archive = document.createElement('button');
        archive.className = "btn btn-sm btn-outline-primary";
        archive.id = "archive";
        archive.innerHTML = "Archive";
        archive.onclick = function() {
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
          load_mailbox('inbox');
        }
        document.querySelector("#emaillayout").append(archive);
      }
    else {
      const archive = document.createElement('button');
      archive.className = "btn btn-sm btn-outline-primary";
      archive.id = "archive";
      archive.innerHTML = "Move To Inbox";
      archive.onclick = function() {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
        load_mailbox('inbox');
      }
      document.querySelector("#emaillayout").append(archive);
    }
  }

    const body = document.createElement('div');
    body.id = "body";
    body.innerHTML = `${email.body}`;
    document.querySelector("#emaillayout").append(body);

  });

}
