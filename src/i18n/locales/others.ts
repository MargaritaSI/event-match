// Compact translations for remaining 12 locales
// Key strings only — nav + most-used labels

const make = (
  navPeople: string, navSchedule: string, navMap: string, navCapture: string, navSponsors: string, navMycard: string,
  wantToMeet: string, matched: string, close: string, save: string, edit: string
) => ({
  nav: { people: navPeople, schedule: navSchedule, map: navMap, capture: navCapture, sponsors: navSponsors, mycard: navMycard },
  people: { wantToMeet, matched, pending: '...', close, icebreakers: 'Ice breakers', contacts: 'Contacts', matchTitle: "It's a match!", matchSubtitle: 'wants to meet you!', matchPrompt: 'Go say hi!', matchIce: 'Start with:', great: 'Great!', commonTopics: 'Common interests', sessions: 'Same sessions', title: 'People', subtitle: 'participants', commonInterests: 'common interests' },
  schedule: { title: navSchedule, day1: 'Day 1', day2: 'Day 2', now: 'NOW', upcoming: 'upcoming', mySchedule: 'My Schedule', addToMine: 'Add', remove: 'Remove', location: 'Location', allTimes: 'Amsterdam time (CEST, UTC+2)', emptyMine: 'Add sessions from schedule' },
  map: { title: navMap, subtitle: 'React Summit 2025', entrance: 'Entrance', registration: 'Registration', workingZone: 'Working Zone', mainStage: 'Web Engineering Track', wc: 'WC', coffee: 'Coffee', food: 'Food', hackathon: 'Hackathon Zone', legend: 'Legend' },
  capture: { title: navCapture, subtitle: 'Write it down now', name: 'Name *', context: 'Context', talked: 'Talked about', nextStep: 'Next step', followUp: 'Follow up in', tomorrow: 'tomorrow', days: 'd', tag: 'Tag', save, saved: 'Saved!', taskOn: 'Task on', contacts: 'Contacts', tags: { networking: '🤝 Networking', client: '💼 Client', collab: '🚀 Collab', other: '📌 Other' } },
  sponsors: { title: navSponsors, subtitle: 'React Summit 2025', forYou: 'Recommended', booth: 'Booth', website: 'Website', hiring: '🔥 Hiring' },
  mycard: { title: navMycard, subtitle: 'Share your contacts', edit, save, cancel: 'Cancel', showQR: '📱 Show QR', hideQR: 'Hide QR', qrHint: 'Scan with phone', qrNote: 'QR: name + contacts', fields: { firstName: 'First name *', lastName: 'Last name', bio: 'About', company: 'Company', city: 'City', country: 'Country', telegram: 'Telegram', instagram: 'Instagram', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', other: 'Other', photo: 'Photo', uploadPhoto: 'Upload', removePhoto: 'Remove photo', interests: 'Interests', sessions: 'My sessions' } },
});

export const de = make('Personen', 'Zeitplan', 'Karte', 'Notiz', 'Sponsoren', 'Meine Karte', 'Kennenlernen', 'Match! 🎉', 'Schließen', 'Speichern', 'Bearbeiten');
export const fr = make('Personnes', 'Programme', 'Plan', 'Capture', 'Sponsors', 'Ma carte', 'Rencontrer', 'Match! 🎉', 'Fermer', 'Enregistrer', 'Modifier');
export const es = make('Personas', 'Horario', 'Mapa', 'Captura', 'Patrocinadores', 'Mi tarjeta', 'Quiero conocer', '¡Match! 🎉', 'Cerrar', 'Guardar', 'Editar');
export const pt = make('Pessoas', 'Agenda', 'Mapa', 'Captura', 'Patrocinadores', 'Meu cartão', 'Quero conhecer', 'Match! 🎉', 'Fechar', 'Salvar', 'Editar');
export const it = make('Persone', 'Programma', 'Mappa', 'Cattura', 'Sponsor', 'Il mio biglietto', 'Voglio incontrare', 'Match! 🎉', 'Chiudi', 'Salva', 'Modifica');
export const pl = make('Ludzie', 'Harmonogram', 'Mapa', 'Notatka', 'Sponsorzy', 'Moja karta', 'Chcę poznać', 'Match! 🎉', 'Zamknij', 'Zapisz', 'Edytuj');
export const cs = make('Lidé', 'Harmonogram', 'Mapa', 'Zachytit', 'Sponzoři', 'Moje karta', 'Chci se setkat', 'Shoda! 🎉', 'Zavřít', 'Uložit', 'Upravit');
export const tr = make('Kişiler', 'Program', 'Harita', 'Not', 'Sponsorlar', 'Kartım', 'Tanışmak istiyorum', 'Eşleşme! 🎉', 'Kapat', 'Kaydet', 'Düzenle');
export const zh = make('人员', '日程', '地图', '记录', '赞助商', '我的名片', '想认识', '匹配！🎉', '关闭', '保存', '编辑');
export const ja = make('参加者', 'スケジュール', 'マップ', 'メモ', 'スポンサー', '自分のカード', '会いたい', 'マッチ！🎉', '閉じる', '保存', '編集');
export const ko = make('참가자', '일정', '지도', '메모', '스폰서', '내 카드', '만나고 싶다', '매치! 🎉', '닫기', '저장', '편집');
export const uk = make('Люди', 'Розклад', 'Карта', 'Нотатка', 'Спонсори', 'Моя картка', 'Хочу познайомитись', 'Метч! 🎉', 'Закрити', 'Зберегти', 'Редагувати');
