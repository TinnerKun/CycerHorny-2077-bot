const request = require('request');
const nhentai = require('nhentai');
const axios = require('axios');
const api = new nhentai.API();
const randomHexColor = require('random-hex-color')
const config = require("../data.json");
const Discord = require("discord.js");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { glob } = require('glob')
const cooldown = new Set();

module.exports = {
    name: "nhtag",
    async run(client, message, args) {
        if (message.channel.nsfw || config.owner.includes(message.author.id)) {
            if (cooldown.has(message.guild.id)) {
                message.reply({ embeds: [new MessageEmbed().setAuthor('โปรดลองอีกครั้งใน 5 วินาที').setColor(randomHexColor())] }).then(msg => {
                    setTimeout(() => msg.delete(), 3000);
                });
                return
            } else {
                cooldown.add(message.guild.id);
                setTimeout(() => {
                    cooldown.delete(message.guild.id);
                }, 5000);
            }
            let argall = args.join(" ");
            let id=0,loop=0;

            const search = async (query = argall, page = Math.floor(Math.random() * 20) + 1) => {
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
            id = await search(argall)
            api.fetchDoujin(id).then(async (doujin) => {

                    const backButton = new MessageButton({
                        style: 'SECONDARY',
                        label: "Back",
                        emoji: "⬅️",
                        customId: 'back'
                    })
                    const forwardButton = new MessageButton({
                        style: 'SECONDARY',
                        label: "Next",
                        emoji: "➡️",
                        customId: 'forward'
                    })

                    const imgs = doujin;
                    function generateEmbed(start) {
                        const current = doujin.pages[start].url;
                        return new MessageEmbed()
                            .setColor("RANDOM")
                            .setTitle(doujin.titles.pretty)
                            .setURL('https://nhentai.net/g/' + id + '/')
                            .setDescription('หน้าที่ ' + (start + 1) + ' จาก ' + imgs.length + ' รหัสเรื่อง: ' + id)
                            .setImage(current)
                            .setTimestamp()
                            .setFooter('Develop By TinnerX');



                    }

                    const embedMessage = await message.reply({
                        embeds: [generateEmbed(0)],
                        components: imgs.length > 1 ? [new MessageActionRow({ components: [forwardButton] })] : []
                    })

                    const collector = embedMessage.createMessageComponentCollector({
                        filter: ({ user }) => user.guild === message.author.guild,
                        time: 1000 * 60 * 20
                    })

                    let currentIndex = 0
                    collector.on('collect', async (interaction) => {
                        interaction.customId === 'back' ? (currentIndex -= 1) : (currentIndex += 1)
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


                });

            
        } else {
            let sfw = new MessageEmbed()
                .setTitle(`Protection SFW Room`)
                .setDescription('เนื้อหาต่อไปนี้เหมาะสำหรับห้อง NSFW เท่านั้น ขอภัย')
                .setColor("#ff0000")
                .setTimestamp()
            message.channel.send({ embeds: [sfw] });
        }
    
    }
}