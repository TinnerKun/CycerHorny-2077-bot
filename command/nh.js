const request = require('request');
const nhentai = require('nhentai');
const api = new nhentai.API();
const randomHexColor = require('random-hex-color')
const config = require("../data.json");
const Discord = require("discord.js");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { glob } = require('glob')
const cooldown = new Set()

module.exports = {
    name: "nh",
    async run(client, message, args) {
        if (message.channel.nsfw  || config.owner.includes(message.author.id)) {
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
            let id = 0;
            let argall = args.join(" ");
            let regx = argall.replace(/\D/g, '');
            if (regx !== "") {
                id = regx
            } else {
                id = Math.floor(Math.random() * (377071 - 370000) + 370000)
            }
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
                    //console.log(current)
                    return new MessageEmbed()
                        .setColor(randomHexColor())
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


            }).catch(function (error) {
                let errnull = new MessageEmbed()
                .setColor(randomHexColor())
                .setTitle("ไม่พบรายการที่ต้องการหา")
                .setImage('https://media.discordapp.net/attachments/889652344202088458/899915858179153940/unknown.png')
                .setDescription('ไม่สามารถค้นพบ รหัส ' + id)
                .setTimestamp()
                .setFooter('Develop By TinnerX');
                return message.channel.send({ embeds: [errnull] });
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