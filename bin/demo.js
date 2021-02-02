#! /usr/bin/env node

const fs = require('fs')
const program = require('commander')
const inquirer = require('inquirer')
const puppeteer = require('puppeteer')

// C:\Program Files (x86)\Google\Chrome\Application\chrome.exe  https://www.hao123.com/

program.action(name => {
    inquirer.prompt([
        { 
            type: 'input',
            name: 'chrome_path',
            message: '请输入谷歌浏览器的路径：',
        },
        { 
            type: 'input',
            name: 'www_address',
            message: '请输入需要监视的服务器地址：',
        },
        { 
            type: 'input',
            name: 'file_name',
            message: '请输入输出的日志文件名：',
        }
    ]).then(function (answers) {
        const params = {
            path: answers.chrome_path,
            addr: answers.www_address,
            name: answers.file_name,
        }
        // console.log(params)
        main(params.path, params.addr, params.name)
    })
})

// 解析命令行参数
program.parse(process.argv)

async function main(chromiumPath, address, fileName) {
    // 启动chrome浏览器
    const browser = await puppeteer.launch({
        // 指定该浏览器的路径
        executablePath: chromiumPath,
        // 是否为无头浏览器模式，默认为无头浏览器模式
        headless: false,
    })
    // 在一个默认的浏览器上下文中被创建一个新页面
    const page = await browser.newPage()

    // 设备模拟：模拟一个iPhone X
    // user agent
    // await page1.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
    // // 视口（viewport）模拟
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    page.on('request', request => {
        // console.log('request', request.headers());
    });

    page.on('response', response => {
        const str1 = response._request.method() + ' ' + response._request.url()
        const str2 = response._status + ' ' + response._headers['content-type']
        const str = JSON.stringify(response._request.headers())

        console.log('\x1B[33mrequest date:\x1B[0m', new Date().toLocaleString())
        console.log('\x1B[32mrequest info:\x1B[0m', str1)
        console.log('\x1B[32mrequest headers:\x1B[0m', str)
        console.log('\x1B[31mresponse type:\x1B[0m', str2)

        if (['xhr', 'fetch'].includes(response._request.resourceType())) {
            const str3 = response._request.postData()
            console.log('\x1B[32mrequest data:\x1B[0m', str3)

            response.text().then(data => {
                console.log('\x1B[31mresponse data:\x1B[0m', data)
                console.log()
                fs.appendFileSync(fileName, 'request date: ' + new Date().toLocaleString() + '\n' + 'request info: ' + str1 + '\n' + 'request headers: ' + str + '\n' + 'response type: ' + str2 + '\n' + 'request data: ' + str3 + '\n' + 'response data: ' + data + '\n\n')
            }).catch(err => {
                console.log('\x1B[31mresponse error: %s\x1B[0m', err)
                fs.appendFileSync(fileName, 'request date: ' + new Date().toLocaleString() + '\n' + 'request info: ' + str1 + '\n' + 'request headers: ' + str + '\n' + 'response type: ' + str2 + '\n' + 'request data: ' + str3 + '\n' + 'response error: ' + err + '\n\n')
            })
        } else {
            console.log()
            fs.appendFileSync(fileName, 'request date: ' + new Date().toLocaleString() + '\n' + 'request info: ' + str1 + '\n' + 'request headers: ' + str + '\n' + 'response type: ' + str2 + '\n\n')
        }
    })

    // 空白页刚问该指定网址
    await page.goto(address)
}

