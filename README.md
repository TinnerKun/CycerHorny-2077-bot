# CycerHorny-2077-bot
## โปรดอ่านก่อนนำไปใช้

โปรดปฏิบัติตามที่ LICENSE กำหนด
- ประกาศเกี่ยวกับใบอนุญาตและลิขสิทธิ์
- การเปลี่ยนแปลงุดคำสั้งต้องเขียนอัปเดตตลอด
- ต้องเปิดเผยแหล่งที่มา 
- การใช้เครือข่ายคือการกระจาย หรือก็คือ ต้องทำการ Fork Code
- ต้องใช้ ใบอนุญาตเดียวกัน เท่านั้น

ไฟล์ที่ห้ามลบ แต่แก้ได้แค่ *name*
ชื่อไฟล s_credit.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

module.exports = {
	names: 'credit',
	data: new SlashCommandBuilder()
		.setName('credit')
		.setDescription('คนทำและผู้ใช้งาน'),
	async execute(client, interaction) {
        let c = new MessageEmbed()
                .setTitle(`ผู้จัดทำ`)
				.setDescription(`
                Script original : NEXT#8233 and ⵝⵉⵏⵏⴻⵔⴿⵓⵏ#5580 // จำเป็นต้องมี
                Bringer to work : //แก้ได้แค่ตรงนี้
                `)
				.setColor('RANDOM')
				.setTimestamp()
		await interaction.reply({embeds : [c]})
	},
};

