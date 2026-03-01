import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import path from 'path'
import fs from 'fs'
import os from 'os'

async function run () {
  try {
    setPlatformURI()

    setEnvVars()

    await installCLI()

    await publishFirmware()
  } catch (error) {
    core.setFailed(error.message)
  }
}

function setPlatformURI () {
  const uri = core.getInput('uri', { required: false })
  if (uri !== '') {
    core.exportVariable('NERVES_HUB_URI', uri)
    core.info(`Platform URI set to ${uri}`)
  }
}

function setEnvVars () {
  const org = core.getInput('org', { required: true })
  core.exportVariable('NERVES_HUB_ORG', org)

  const product = core.getInput('product', { required: true })
  core.exportVariable('NERVES_HUB_PRODUCT', product)

  const token = core.getInput('token', { required: true })
  core.exportVariable('NERVES_HUB_TOKEN', token)

  const keysPath = path.join(os.homedir(), '.nerves_cloud')
  fs.mkdirSync(keysPath, { recursive: true })

  const publicKey = core.getInput('public-key', { required: true })
  const publicKeyPath = path.join(keysPath, 'signing_key.pub')
  fs.writeFileSync(publicKeyPath, publicKey)
  core.exportVariable('NERVES_HUB_FW_PUBLIC_KEY_PATH', publicKeyPath)

  const privateKey = core.getInput('private-key', { required: true })
  const privateKeyPath = path.join(keysPath, 'signing_key.priv')
  fs.writeFileSync(privateKeyPath, privateKey)
  core.exportVariable('NERVES_HUB_FW_PRIVATE_KEY_PATH', privateKeyPath)
}

async function installCLI () {
  const binPath = path.join(os.homedir(), '.bin')
  fs.mkdirSync(binPath, { recursive: true })

  const cliVersion = core.getInput('version', { required: true })

  let cliDownloadUri
  if (cliVersion === 'latest') {
    cliDownloadUri =
      'https://github.com/nerves-hub/nerves_hub_cli/releases/latest/download/linux-x86_64.tar.xz'
  } else {
    cliDownloadUri = `https://github.com/nerves-hub/nerves_hub_cli/releases/download/v${cliVersion}/linux-x86_64.tar.xz`
  }

  const pathToTarball = await tc.downloadTool(cliDownloadUri)
  const pathToCLI = await tc.extractTar(pathToTarball, binPath, '-xJ')

  core.debug(`CLI installed at ${pathToCLI}`)
  core.addPath(pathToCLI)

  let versionOutput = ''
  await exec.exec('nh', ['version'], {
    silent: true,
    listeners: {
      stdout: (data) => (versionOutput += data.toString())
    }
  })

  let parsedVersion = ''
  if (versionOutput.startsWith('v')) {
    parsedVersion = versionOutput
  } else {
    parsedVersion = cliVersion
  }

  core.setOutput('cli-version', parsedVersion)
  core.info(`Version ${parsedVersion} of the NervesCloud CLI installed`)
}

async function publishFirmware () {
  const args = ['firmware', 'publish']

  const firmwarePath = core.getInput('firmware', { required: false })
  if (firmwarePath !== '') {
    const resolvedFirmwarePath = path.resolve(
      process.env.GITHUB_WORKSPACE,
      firmwarePath
    )
    args.push(resolvedFirmwarePath)
  }

  const deployment = core.getInput('deployment', { required: false })
  if (deployment !== '') {
    args.push('--deploy', deployment)
  }

  const workingDirectory = core.getInput('working-directory', {
    required: false
  })
  const customWorkingDirectory = path.resolve(
    process.env.GITHUB_WORKSPACE,
    workingDirectory
  )

  await exec.exec('nh', args, { cwd: customWorkingDirectory })

  if (deployment !== '') {
    core.notice('Firmware uploaded to deployment successfully')
  } else {
    core.notice('Firmware uploaded successfully')
  }
}

(async () => {
  try {
    await run()
  } catch (error) {
    core.setFailed(error.message)
  }
})()
