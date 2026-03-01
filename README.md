# upload-nerves-firmware

This action signs and uploads your Nerves firmware to NervesCloud.

You can also deploy your firmware to your Deployment of choice. (optional)

## Inputs

### `token`

**Required** The token to use for authentication with NervesCloud.

### `org`

**Required** The org name for your NervesCloud account.

### `product`

**Required** The product name for your NervesCloud account.

### `private-key`

**Required** The private key to use for signing your firmware.

### `public-key`

**Required** The public key to use for signing your firmware.

### `uri`

**Optional** The URI of the NervesCloud instance to deploy to. Defaults to `https://manage.nervescloud.com`.

### `deployment`

**Optional** The name of the deployment to create a new release in.

### `working-directory`

**Optional** The working directory to use for the firmware deployment. The default is the directory containing your GitHub repo.

## Outputs

The action provides the following outputs:

| Output               | Content
|-                     |-
| `cli-version`        | The CLI version, e.g. `v3.1.0`

## Example usage

```yaml
- name: Upload firmware to NervesCloud
  uses: nervescloud/upload-nerves-firmware
  with:
    token: ${{ secrets.NERVES_CLOUD_TOKEN }}
    org: MyOrg
    product: my_product
    private-key: ${{ secrets.NERVES_CLOUD_PRIVATE_KEY }}
    public-key: ${{ secrets.NERVES_CLOUD_PUBLIC_KEY }}
    deployment: QA Testing # optional
    uri: https://my.platform.com # optional, default is https://manage.nervescloud.com
    working-directory: subDirForApp # optional
    firmware: path/to/firmware/file.fw # optional
    version: 3.0.0 # optional, default is latest released version
```
