<script lang="ts">
	import { agendaStore } from '$lib/stores/agenda';
	import type { Agenda } from '$lib/types/quran';
	import { 
		CalendarDays, 
		MapPin, 
		User, 
		Clock, 
		Bell, 
		Sparkles, 
		CheckCircle, 
		Share2,
		X
	} from 'lucide-svelte';

	let selectedCategory: string = 'Semua';
	let registeredEvents = new Set<string>();
	let selectedAgendaForDetail: Agenda | null = null;
	let isDetailModalOpen = false;

	const categories = ['Semua', 'Kajian', 'Tilawah', 'Event', 'Pengingat'];

	$: filteredAgendas = selectedCategory === 'Semua' 
		? $agendaStore 
		: $agendaStore.filter(a => a.category === selectedCategory);

	function toggleRegister(id: string) {
		if (registeredEvents.has(id)) {
			registeredEvents.delete(id);
		} else {
			registeredEvents.add(id);
		}
		registeredEvents = new Set(registeredEvents);
	}

	function openDetail(item: Agenda) {
		selectedAgendaForDetail = item;
		isDetailModalOpen = true;
	}
</script>

<svelte:head>
	<title>Agenda Kajian & Tilawah - Portal Qur'an v3.3</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
	
	<!-- Header Banner -->
	<div class="relative overflow-hidden rounded-3xl bg-gradient-luxury text-quran-cream p-6 sm:p-8 shadow-luxury border border-quran-gold/40">
		<div class="absolute inset-0 bg-islamic-pattern-dark opacity-20 pointer-events-none"></div>
		<div class="relative z-10 max-w-2xl">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-quran-gold/30 text-xs font-semibold text-quran-gold mb-2">
				<CalendarDays class="w-3.5 h-3.5" />
				<span>Majelis & Kegiatan Komunitas</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Agenda Kajian & Event Qur'an
			</h1>
			<p class="text-xs sm:text-sm text-quran-goldLight mt-1.5 leading-relaxed">
				Tingkatkan pemahaman dan kecintaan terhadap Al-Qur'an melalui kajian tematik, simaan bersama, dan webinar interaktif.
			</p>
		</div>
	</div>

	<!-- Category Filter Tabs -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1">
		{#each categories as cat}
			<button 
				on:click={() => selectedCategory = cat}
				class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all {selectedCategory === cat ? 'bg-gradient-luxury text-quran-gold shadow-gold' : 'bg-quran-surface text-quran-dark border border-quran-border hover:bg-quran-sand'}"
			>
				{cat}
			</button>
		{/each}
	</div>

	<!-- Agenda Cards Grid -->
	{#if filteredAgendas.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredAgendas as agenda}
				{@const isRegistered = registeredEvents.has(agenda.id)}

				<div class="bg-quran-surface rounded-3xl border border-quran-border/80 shadow-luxury overflow-hidden flex flex-col justify-between hover:border-quran-gold hover:shadow-luxury-hover transition-all group">
					
					<!-- Event Image Banner -->
					{#if agenda.image_url}
						<div class="h-44 w-full relative overflow-hidden bg-quran-dark">
							<img 
								src={agenda.image_url} 
								alt={agenda.title} 
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-quran-dark/90 via-transparent to-transparent"></div>
							<div class="absolute top-3 left-3">
								<span class="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-quran-dark/80 text-quran-gold backdrop-blur-md border border-quran-gold/40">
									{agenda.category}
								</span>
							</div>
						</div>
					{/if}

					<!-- Content Body -->
					<div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
						<div>
							<!-- Date & Time -->
							<div class="flex items-center gap-2 text-xs font-bold text-quran-gold mb-2">
								<Clock class="w-3.5 h-3.5" />
								<span>{new Date(agenda.event_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</span>
							</div>

							<h2 class="text-base font-extrabold text-quran-dark group-hover:text-quran-primary transition line-clamp-2">
								{agenda.title}
							</h2>

							<p class="text-xs text-quran-warm mt-2 line-clamp-3 leading-relaxed">
								{agenda.description}
							</p>
						</div>

						<!-- Meta info: Speaker & Location -->
						<div class="pt-4 border-t border-quran-border/60 space-y-2 text-xs text-quran-chocolate">
							{#if agenda.speaker}
								<div class="flex items-center gap-2">
									<User class="w-3.5 h-3.5 text-quran-gold flex-shrink-0" />
									<span class="truncate font-medium">{agenda.speaker}</span>
								</div>
							{/if}
							<div class="flex items-center gap-2">
								<MapPin class="w-3.5 h-3.5 text-quran-gold flex-shrink-0" />
								<span class="truncate font-medium">{agenda.location}</span>
							</div>
						</div>
					</div>

					<!-- Card Footer Actions -->
					<div class="p-4 bg-quran-sand/50 border-t border-quran-border flex items-center justify-between gap-2">
						<button 
							on:click={() => openDetail(agenda)}
							class="text-xs font-bold text-quran-warm hover:text-quran-dark transition"
						>
							Lihat Detail
						</button>

						<button 
							on:click={() => toggleRegister(agenda.id)}
							class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm {isRegistered ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gradient-luxury text-quran-cream shadow-gold hover:scale-105 active:scale-95'}"
						>
							{#if isRegistered}
								<CheckCircle class="w-3.5 h-3.5 text-green-700" />
								<span>Terdaftar / Diingatkan</span>
							{:else}
								<Bell class="w-3.5 h-3.5 text-quran-gold" />
								<span>Pasang Pengingat</span>
							{/if}
						</button>
					</div>

				</div>
			{/each}
		</div>
	{:else}
		<div class="p-12 bg-quran-surface rounded-3xl border border-quran-border text-center">
			<CalendarDays class="w-12 h-12 text-quran-gold mx-auto mb-3 opacity-60" />
			<h3 class="text-sm font-bold text-quran-dark">Belum ada agenda pada kategori ini</h3>
			<p class="text-xs text-quran-warm mt-1">Admin dapat menambahkan agenda kajian baru dari dashboard admin.</p>
		</div>
	{/if}

	<!-- Detail Modal -->
	{#if isDetailModalOpen && selectedAgendaForDetail}
		<div 
			class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-quran-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
			on:click={() => isDetailModalOpen = false}
			on:keydown={(e) => e.key === 'Escape' && (isDetailModalOpen = false)}
			role="button"
			tabindex="0"
			aria-label="Tutup Detail Agenda"
		>
			<div 
				class="bg-quran-surface rounded-3xl max-w-lg w-full border border-quran-gold/40 shadow-luxury-hover overflow-hidden animate-in zoom-in-95 duration-150"
				on:click|stopPropagation
				on:keydown|stopPropagation
				role="dialog"
				aria-modal="true"
				tabindex="-1"
			>
				<div class="bg-gradient-luxury p-5 text-quran-cream flex items-center justify-between">
					<span class="text-xs font-bold uppercase tracking-wider text-quran-gold">
						Detail Agenda {selectedAgendaForDetail.category}
					</span>
					<button on:click={() => isDetailModalOpen = false} class="p-1 text-quran-goldLight hover:text-white" aria-label="Tutup">
						<X class="w-5 h-5" />
					</button>
				</div>

				<div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
					<h3 class="text-lg font-bold text-quran-dark">
						{selectedAgendaForDetail.title}
					</h3>

					<div class="p-3.5 rounded-2xl bg-quran-sand border border-quran-border space-y-2 text-xs">
						<div class="flex items-center gap-2 text-quran-dark font-semibold">
							<Clock class="w-4 h-4 text-quran-gold" />
							<span>{new Date(selectedAgendaForDetail.event_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</span>
						</div>
						<div class="flex items-center gap-2 text-quran-dark">
							<MapPin class="w-4 h-4 text-quran-gold" />
							<span>{selectedAgendaForDetail.location}</span>
						</div>
						{#if selectedAgendaForDetail.speaker}
							<div class="flex items-center gap-2 text-quran-dark">
								<User class="w-4 h-4 text-quran-gold" />
								<span>Narasumber: {selectedAgendaForDetail.speaker}</span>
							</div>
						{/if}
					</div>

					<p class="text-xs text-quran-dark leading-relaxed">
						{selectedAgendaForDetail.description}
					</p>
				</div>

				<div class="p-4 bg-quran-sand border-t border-quran-border flex justify-end">
					<button 
						on:click={() => isDetailModalOpen = false}
						class="px-5 py-2 rounded-xl bg-quran-primary text-white text-xs font-bold hover:bg-quran-dark transition"
					>
						Tutup
					</button>
				</div>
			</div>
		</div>
	{/if}

</div>
