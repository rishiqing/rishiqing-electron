import path from 'node:path'
import fs from 'node:fs'
import fsExtra from 'fs-extra'

export const preparePackageJson = () => {
    const pkgJsonPath = path.join(process.cwd(), 'package.json')
    const localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    const electronConfig = localPkgJson.devDependencies.electron.replace('^', '')
    localPkgJson.main = 'mainEntry.js'
    delete localPkgJson.scripts
    delete localPkgJson.devDependencies
    localPkgJson.devDependencies = { electron: electronConfig }
    localPkgJson.electronVersion = electronConfig
    localPkgJson.releaseTime = (new Date()).toString()
    const tarJsonPath = path.join(process.cwd(), 'dist', 'package.json')
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson))
    // electron-build有些默认行为，创建node_modules会阻止这些行为
    fsExtra.ensureDirSync(path.join(process.cwd(), 'dist/node_modules'))
  }