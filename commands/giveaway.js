const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// IDs der Rollen, die Giveaways starten bzw. auslosen dürfen
const GIVEAWAY_START_ROLE = '1403092076769443988'; // z.B. '123456789012345678'
const GIVEAWAY_DRAW_ROLE = '1403092076769443988'; // z.B. '987654321098765432'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Starte oder lose ein Giveaway aus.')
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Erstellt ein neues Giveaway.')
                .addStringOption(opt =>
                    opt.setName('preis')
                        .setDescription('Was gibt es zu gewinnen?')
                        .setRequired(true))
                .addIntegerOption(opt =>
                    opt.setName('dauer')
                        .setDescription('Dauer des Giveaways in Minuten (optional)')
                        .setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('auslosen')
                .setDescription('Lost das aktuelle Giveaway aus.')
                .addStringOption(opt =>
                    opt.setName('nachricht')
                        .setDescription('Nachrichten-ID des Giveaways')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        // Giveaway starten
        if (interaction.options.getSubcommand() === 'start') {
            if (!interaction.member.roles.cache.has(GIVEAWAY_START_ROLE)) {
                return interaction.reply({ content: 'Du hast keine Berechtigung, ein Giveaway zu starten.', ephemeral: true });
            }

            const preis = interaction.options.getString('preis');
            const dauer = interaction.options.getInteger('dauer'); // Minuten oder undefined

            let description = `Preis: **${preis}**\n\nReagiere mit 🎁, um teilzunehmen!`;
            let endTimestamp = null;
            if (dauer && dauer > 0) {
                endTimestamp = Math.floor(Date.now() / 1000) + dauer * 60;
                description += `\n\n🕒 Endet <t:${endTimestamp}:R>`;
            }

            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway!')
                .setDescription(description)
                .setColor(0xFFD700)
                .setFooter({ text: `Gestartet von ${interaction.user.tag}` })
                .setTimestamp();

            const message = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            await message.react('🎁');

            // Collector für Teilnahme-Reaktionen
            const filter = (reaction, user) => reaction.emoji.name === '🎁' && !user.bot;
            const collector = message.createReactionCollector({ filter, dispose: true });

            collector.on('collect', async (reaction, user) => {
                try {
                    const member = await interaction.guild.members.fetch(user.id);
                    await user.send(`Du hast erfolgreich am Giveaway teilgenommen! Viel Glück! 🍀`);
                } catch (e) {
                    // Falls DM nicht möglich, ignoriere
                }
            });

            // Optional: Automatisch auslosen nach Ablauf
            if (endTimestamp) {
                setTimeout(async () => {
                    try {
                        const updatedMsg = await message.fetch();
                        const reaction = updatedMsg.reactions.cache.get('🎁');
                        if (!reaction) return;

                        const users = await reaction.users.fetch();
                        const teilnehmer = users.filter(u => !u.bot).map(u => u);

                        if (teilnehmer.length === 0) {
                            await message.reply({ content: 'Keine Teilnehmer für das Giveaway gefunden.' });
                            return;
                        }

                        const winner = teilnehmer[Math.floor(Math.random() * teilnehmer.length)];
                        await message.reply({ content: `🎉 Das Giveaway ist beendet! Gewinner: <@${winner.id}>! Herzlichen Glückwunsch!` });
                    } catch (err) {
                        await message.reply({ content: 'Fehler beim automatischen Auslosen.' });
                    }
                }, dauer * 60 * 1000);
            }

        // Giveaway auslosen
        } else if (interaction.options.getSubcommand() === 'auslosen') {
            if (!interaction.member.roles.cache.has(GIVEAWAY_DRAW_ROLE)) {
                return interaction.reply({ content: 'Du hast keine Berechtigung, das Giveaway auszulosen.', ephemeral: true });
            }

            const nachrichtId = interaction.options.getString('nachricht');
            try {
                const channel = interaction.channel;
                const giveawayMsg = await channel.messages.fetch(nachrichtId);
                const reaction = giveawayMsg.reactions.cache.get('🎁');
                if (!reaction) return interaction.reply({ content: 'Keine Teilnehmer gefunden.', ephemeral: true });

                const users = await reaction.users.fetch();
                const teilnehmer = users.filter(u => !u.bot).map(u => u);

                if (teilnehmer.length === 0) {
                    return interaction.reply({ content: 'Keine Teilnehmer gefunden.', ephemeral: true });
                }

                const winner = teilnehmer[Math.floor(Math.random() * teilnehmer.length)];
                await interaction.reply({ content: `🎉 Der Gewinner ist: <@${winner.id}>! Herzlichen Glückwunsch!`, ephemeral: false });
            } catch (err) {
                await interaction.reply({ content: 'Fehler beim Auslosen. Stelle sicher, dass die Nachrichten-ID korrekt ist und ich Zugriff habe.', ephemeral: true });
            }
        }
    }
};