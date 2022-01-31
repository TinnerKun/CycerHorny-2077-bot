const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js')
const axios = require('axios');
const nhentai = require('nhentai');
const api = new nhentai.API();
const cooldown = new Set()


module.exports = {
	names: 'nhtag',
	data: new SlashCommandBuilder()
	.setName('nhtag')
	.setDescription('Random Nhentai Use Tag')
	.addStringOption(option => option.setName('tags').setDescription('ใช้ Tag ให้เป็นประโยชน์')),
	async execute(client , interaction) { 
        try {
            const string = interaction.options.getString('tags');

        let check = client.channels.cache.get(interaction.channelId);
        if (check.nsfw === true) {
        let loading = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle("Loading...")
                    .setImage('https://cdn.discordapp.com/attachments/889652344202088458/935468552750792744/00_00_00-00_00_30.gif')
                    .setDescription('โปรดรอหน่อย น่าา ระบบกำลังหาให้')
                    .setTimestamp()
                    .setFooter('Develop By TinnerX');
        await interaction.reply({embeds: [loading]});

        if (cooldown.has(interaction.guildId)) {
            await interaction.reply({ embeds: [new MessageEmbed().setAuthor('โปรดลองอีกครั้งใน 5 วินาที').setColor('RANDOM')] }).then(msg => {
                setTimeout(() => interaction.deleteReply(), 3000);
            });
            return
        } else {
            cooldown.add(interaction.guildId);
            setTimeout(() => {
                cooldown.delete(interaction.guildId);
            }, 5000);
        }

        let id=0,loop=0;
        const search = async (query = string, page = Math.floor(Math.random() * 20) + 1) => {
            const res = await axios({
                url: `https://nhentai.net/api/galleries/search?query=${encodeURIComponent(query)}&page=${page}`
            }).catch(c => { search(query) })
            if (res?.data) {
                if (res.data.result.length < 1) {
                    if(loop == 1) {
                        loop = 0;
                        return search("random", 1)
                    } else {
                        loop++
                        return search(query, 1)
                    }
                } else {
                    return res.data.result[Math.floor(Math.random() * res.data.result.length)]?.id ? res.data.result[Math.floor(Math.random() * res.data.result.length)]?.id : search(query, 1)
                }
            } else {
                return search('loli')
            }
        }
        id = await search(string)
			api.fetchDoujin(id).then(async (doujin) => {        
                const timestamp = Date.now();        
                const imgs = doujin;

                function generateEmbed(start) {
                    const current = doujin.pages[start].url;
                    return new MessageEmbed()
                        .setColor('RANDOM')
                        .setTitle(doujin.titles.pretty)
                        .setURL('https://nhentai.net/g/' + id + '/')
                        .setDescription('หน้าที่ ' + (start + 1) + ' จาก ' + imgs.length + ' รหัสเรื่อง: ' + id)
                        .setImage(current)
                        .setTimestamp()
                        .setFooter('Develop By TinnerX');
                }
                const backButton = new MessageButton()
                        .setCustomId('back-nhtag='+id+'-'+timestamp)
                        .setLabel('Back')
                        .setStyle('SECONDARY')
                        .setEmoji('⬅️')
                    
                const forwardButton = new MessageButton()
                        .setCustomId('forward-nhtag='+id+'-'+timestamp)
                        .setLabel('Forward')
                        .setStyle('SECONDARY')
                        .setEmoji('➡️')

                const embedMessage = await interaction.editReply({
                    embeds: [generateEmbed(0)],
                    components: imgs.length > 1 ? [new MessageActionRow({ components: [forwardButton] })] : []
                })

                const collector = embedMessage.channel.createMessageComponentCollector({
                    filter: (button) => button.guildId === interaction.guildId,
                    time: 1000 * 60 * 20
                })
                let currentIndex = 0
                collector.on('collect', async (interaction) => {
                    if(interaction.customId !== 'back-nhtag='+id+'-'+timestamp && interaction.customId !== 'forward-nhtag='+id+'-'+timestamp) return;
                    interaction.customId === 'back-nhtag='+id+'-'+timestamp ? (currentIndex -= 1) : (currentIndex += 1)
                    interaction.deferUpdate()
                    await interaction.message.edit({
                        embeds: [generateEmbed(currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 1 < imgs.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    })
                })
            }).catch(async function (error) {
                let errnull = new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle("ไม่พบรายการที่ต้องการหา")
                    .setImage('https://media.discordapp.net/attachments/889652344202088458/899915858179153940/unknown.png')
                    .setDescription('ไม่สามารถค้นพบ รหัส ' + id)
                    .setTimestamp()
                    .setFooter('Develop By TinnerX');
                await interaction.editReply({embeds: [errnull] });
            });
        } else {
            async function post() {
                let sfw = new MessageEmbed()
                    .setTitle(`Protection SFW Room`)
                    .setDescription('เนื้อหาต่อไปนี้เหมาะสำหรับห้อง NSFW เท่านั้น ขอภัย')
                    .setColor("#ff0000")
                    .setTimestamp()
                await interaction.reply({ embeds: [sfw] });
            }
            post();
        }
        } catch (error) {
            async function post() {
                let sfw = new MessageEmbed()
                    .setTitle(`บอท Catch ตึงๆ`)
                    .setDescription('เบาได้เบาไอพวกเหรี้ย')
                    .setColor("#ff0000")
                    .setTimestamp()
                await interaction.reply({ embeds: [sfw] });
            }
            post();
        }       
    }
};
