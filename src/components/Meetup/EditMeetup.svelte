<script>
  import meetups from './meetups-store';
  import { createEventDispatcher } from 'svelte';
  import TextInput from '../UI/TextInput.svelte';
  import Button from '../UI/Button.svelte';
  import Modal from '../UI/Modal.svelte';
  import { isEmpty, isValidEmail } from '../helpers/validation';

  export let id = null;

  let title = '';
  let subtitle = '';
  let address = '';
  let imageUrl = '';
  let email = '';
  let description = '';
  let formIsValid = false;

  if (id) {
    const unsubscribe = meetups.subscribe(items => {
      const selectedMeetup = items.find(i => i.id === id);
      title = selectedMeetup.title;
      subtitle = selectedMeetup.subtitle;
      address = selectedMeetup.address;
      imageUrl = selectedMeetup.imageUrl;
      email = selectedMeetup.email;
      description = selectedMeetup.description;
    });

    unsubscribe();
  }

  const dispatch = createEventDispatcher();

  $: titleValid = !isEmpty(title);
  $: subtitleValid = !isEmpty(subtitle);
  $: addressValid = !isEmpty(address);
  $: imageUrlValid = !isEmpty(imageUrl);
  $: emailValid = isValidEmail(email);
  $: descriptionValid = !isEmpty(description);
  $: formIsValid = titleValid && subtitleValid && addressValid && imageUrlValid && emailValid && descriptionValid;

  function submitForm() {
    const meetupData = {
      title,
      subtitle,
      description,
      imageUrl,
      address,
      email,
    };

    if (id) {
      fetch(`https://svelte-meetup-app-213b5-default-rtdb.europe-west1.firebasedatabase.app/meetups/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify(meetupData),
        headers: { 'content-type': 'application/json' },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('An error occured, please try again.');
          }
          meetups.updateMeetup(id, meetupData);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      fetch('https://svelte-meetup-app-213b5-default-rtdb.europe-west1.firebasedatabase.app/meetups.json', {
        method: 'POST',
        body: JSON.stringify({ ...meetupData, isFavorite: false }),
        headers: { 'content-type': 'application/json' },
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('An error occured, please try again.');
          }
          return res.json();
        })
        .then(data => {
          meetups.addMeetup({ ...meetupData, isFavorite: false, id: data.name });
        })
        .catch(err => {
          console.log(err);
        });
    }
    dispatch('save');
  }

  const removeMeetup = () => {
    fetch(`https://svelte-meetup-app-213b5-default-rtdb.europe-west1.firebasedatabase.app/meetups/${id}.json`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('An error occured, please try again.');
        }
        meetups.removeMeetup(id);
      })
      .catch(err => {
        console.log(err);
      });
    dispatch('save');
  };

  function cancel() {
    dispatch('cancel');
  }
</script>

<Modal title="Edit Meetup Data" on:cancel>
  <form on:submit|preventDefault={submitForm}>
    <TextInput
      id="title"
      label="Title"
      valid={titleValid}
      validityMessage="Please enter a valid title."
      value={title}
      on:input={event => (title = event.target.value)}
    />
    <TextInput
      id="subtitle"
      label="Subtitle"
      valid={subtitleValid}
      validityMessage="Please enter a valid subtitle."
      value={subtitle}
      on:input={event => (subtitle = event.target.value)}
    />
    <TextInput
      id="address"
      label="Address"
      valid={addressValid}
      validityMessage="Please enter a valid address."
      value={address}
      on:input={event => (address = event.target.value)}
    />
    <TextInput
      id="imageUrl"
      label="Image URL"
      valid={imageUrlValid}
      validityMessage="Please enter a valid image URL"
      value={imageUrl}
      on:input={event => (imageUrl = event.target.value)}
    />
    <TextInput
      id="email"
      label="E-Mail"
      valid={emailValid}
      validityMessage="Please enter a valid Email."
      value={email}
      type="email"
      on:input={event => (email = event.target.value)}
    />
    <TextInput
      id="description"
      label="Description"
      value={description}
      valid={descriptionValid}
      validityMessage="Please enter a description."
      controlType="textarea"
      on:input={event => (description = event.target.value)}
    />
  </form>
  <div slot="footer">
    <Button type="button" mode="outline" on:click={cancel}>Cancel</Button>
    <Button type="button" on:click={submitForm} disabled={!formIsValid}>Save</Button>
    {#if id}
      <Button type="button" on:click={removeMeetup}>Delete</Button>
    {/if}
  </div>
</Modal>

<style>
  form {
    width: 100%;
  }
</style>
