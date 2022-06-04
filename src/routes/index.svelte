<script context="module">
  export function preload(page) {
    console.log(page);

    return this.fetch('https://svelte-meetup-app-213b5-default-rtdb.europe-west1.firebasedatabase.app/meetups.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Fetching meetups failed, please try again.');
        }
        return res.json();
      })
      .then(data => {
        const loadedMeetups = [];
        for (const key in data) {
          loadedMeetups.push({
            ...data[key],
            id: key,
          });
        }
        return { fetchedMeetups: loadedMeetups };
      })
      .catch(err => {
        console.log(err);
        this.error(500, 'Could not fetch meetups');
      });
  }
</script>

<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import meetups from '../meetups-store';
  import MeetupItem from '../components/Meetup/MeetupItem.svelte';
  import MeetupFilter from '../components/Meetup/MeetupFilter.svelte';
  import EditMeetup from '../components/Meetup/EditMeetup.svelte';
  import Button from '../components/UI/Button.svelte';
  import LoadingSpinner from '../components/UI/LoadingSpinner.svelte';

  export let fetchedMeetups;
  let editMode;
  let editedId;
  let isLoading;

  const dispatch = createEventDispatcher();

  let favsOnly = false;

  onMount(() => {
    meetups.setMeetups(fetchedMeetups);
  });

  $: filteredMeetups = favsOnly ? fetchedMeetups.filter(m => m.isFavorite) : fetchedMeetups;

  const setFilter = event => {
    favsOnly = event.detail === 1;
  };

  function savedMeetup(event) {
    editMode = null;
    editedId = null;
  }

  function cancelEdit() {
    editMode = null;
    editedId = null;
  }

  function startEdit(event) {
    editMode = 'edit';
    editedId = event.detail;
  }
</script>

<svelte:head>
  <title>All Meetups</title>
</svelte:head>

{#if editMode === 'edit'}
  <EditMeetup id={editedId} on:save={savedMeetup} on:cancel={cancelEdit} />
{/if}
{#if isLoading}
  <LoadingSpinner />
{:else}
  <section id="meetup-controls">
    <MeetupFilter on:select={setFilter} />
    <Button on:click={() => dispatch('add')}>New Meetup</Button>
  </section>
  {#if filteredMeetups === 0}
    <p id="no-meetups">No meetups found. You can start adding some.</p>
  {/if}
  <section id="meetups">
    {#each filteredMeetups as meetup (meetup.id)}
      <div transition:scale animate:flip={{ duration: 300 }}>
        <MeetupItem
          id={meetup.id}
          title={meetup.title}
          subtitle={meetup.subtitle}
          description={meetup.description}
          imageUrl={meetup.imageUrl}
          address={meetup.address}
          isFav={meetup.isFavorite}
          email={meetup.email}
          on:showdetails
          on:edit
        />
      </div>
    {/each}
  </section>
{/if}

<style>
  #meetups {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
  }

  #no-meetups {
    margin: 1rem;
  }

  #meetup-controls {
    margin: 1rem;
    display: flex;
    justify-content: space-between;
  }

  @media (min-width: 768px) {
    #meetups {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
