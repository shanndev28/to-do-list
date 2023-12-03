const fs = require('fs')
const http = require('http')
const express = require('express')

const port = 8009 || process.env.PORT

const app = express()
const server = http.createServer(app)
const socket = require('socket.io')(server)

app.set("json spaces", 3)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/library/view')

// ========== [ HOME ] ========== \\
app.get('/', (req, res) => { res.render('view') })

socket.on('connect', io => {
    // ========== [ GET LIST ] ========== \\
    io.on('get-list', async () => {
        if (!fs.existsSync('./library/list.json')) {
            await fs.writeFileSync('./library/list.json', JSON.stringify([]))
            return io.emit('get-list-cb', { status: false, message: 'data tidak ditemukan' })
        } else {
            let file = require('./library/list.json')

            if (file.length) return io.emit('get-list-cb', { status: true, result: file })
            if (!file.length) return io.emit('get-list-cb', { status: false, message: 'data tidak ditemukan' })
        }
    })

    // ========== [ HAPUS LIST ] ========== \\
    io.on('del-list', async (name) => {
        console.log(name)
        if (!name.toLowerCase()) return io.emit('del-list-cb', { status: false, message: 'parameter diperlukan' })
        if (!fs.existsSync('./library/list.json')) return io.emit('del-list-cb', { status: false, message: 'data tidak ditemukan' })

        let file = require('./library/list.json')
        let indexName = file.indexOf(name.toLowerCase())
        if (!file.filter(a => a === name.toLowerCase()).length) return io.emit('del-list-cb', { status: false, message: 'data tidak ditemukan' })

        await file.splice(indexName, 1)
        await fs.writeFileSync('./library/list.json', JSON.stringify(file))
        return io.emit('del-list-cb', { status: true, message: 'data berhasil dihapus' })
    })

    // ========== [ TAMBAH LIST ] ========== \\
    io.on('add-list', async (name) => {
        if (!name.toLowerCase()) return io.emit('add-list-cb', { status: false, message: 'parameter diperlukan' })

        if (!fs.existsSync('./library/list.json')) {
            await fs.writeFileSync('./library/list.json', JSON.stringify([]))

            let file = require('./library/list.json')
            let fileFind = file.filter(a => a === name.toLowerCase())

            if (fileFind.length) return io.emit('add-list-cb', { status: false, message: "data sudah tersedia" })
            if (!fileFind.length) {
                await file.push(name.toLowerCase())
                await fs.writeFileSync('./library/list.json', JSON.stringify(file))

                return io.emit('add-list-cb', { status: true, message: "data berhasil ditambahkan" })
            }
        } else {
            let file = require('./library/list.json')
            let fileFind = file.filter(a => a === name.toLowerCase())

            if (fileFind.length) return io.emit('add-list-cb', { status: false, message: "data sudah tersedia" })
            if (!fileFind.length) {
                await file.push(name.toLowerCase())
                await fs.writeFileSync('./library/list.json', JSON.stringify(file))

                return io.emit('add-list-cb', { status: true, message: "data berhasil ditambahkan" })
            }
        }
    })
})

// ========== [ JANGAN UBAH INI PLS ] ========== \\
process.on('uncaughtException', (e) => { console.log(`[ ! ] ${e.message}`) })
server.listen(port, () => { console.log(`[ ! ] server listen on ${port} :)`) })