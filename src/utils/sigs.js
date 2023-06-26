import {CoinType, newBLSAddress, newDelegatedAddress, newSecp256k1Address} from "@glif/filecoin-address";
import {getBytes, keccak256, Wallet} from "ethers";
import __wbg_init, {
    blsPublicKey,
    blsSign,
    delegatedPublicKey,
    delegatedSign,
    secp256k1PublicKey,
    secp256k1Sign,
} from "./filecoin_signer_wasm.js";
import {BaseNone} from "basenone";


var filecoinSignerWasmUrl = undefined

export function SetFilecoinSignerWasmUrl(s) {
    filecoinSignerWasmUrl = s
}

export function isEqualAddress(addr0, addr1) {
    if (addr0.length !== addr1.length) {
        return false;
    }

    if (addr0.length === 0) {
        return true;
    }

    return (addr0.substring(1) === addr1.substring(1));
}

export function getTimestamp(start_at, block_delay_secs, height) {
    return start_at + (block_delay_secs * height)
}

export function getHeight(start_at, block_delay_secs, curr_time) {
    let duration = curr_time - start_at;
    if (duration < 0) {
        throw new Error("illegal time")
    }

    let height = parseInt(duration / block_delay_secs)
    return {
        "height": height,
        "revision_time": getTimestamp(start_at, block_delay_secs, height)
    }
}


export class Sigs {
    static async getAddressByKeywords(network, keywords) {
        await __wbg_init(filecoinSignerWasmUrl);
        var privateKey = Sigs._getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromSecp256k1(network, privateKey);
        var publicAddresses = [];

        for (var i = 0; i < sigs.length; i++) {
            publicAddresses.push(sigs[i].GetAddress());
        }

        return publicAddresses;
    }


    static async SignByKeywords(network, keywords, privateType, msg) {
        await __wbg_init(filecoinSignerWasmUrl)
        var privateKey = Sigs._getPrivateKeyByKeywords(keywords);
        var sigs = Sigs.fromSecp256k1(network, privateKey);

        switch (privateType) {
            case "secp256k1":
                return sigs[0].Sign(msg)
            case "delegated":
                return sigs[1].Sign(msg)
            default:
                throw new Error("illegal private type " + privateType)
        }
    }

    static async getAddressesByPrivateKey(network, privateKey) {
        await __wbg_init(filecoinSignerWasmUrl);
        try {
            var sigs = Sigs.fromSecp256k1(network, privateKey);
            var publicAddresses = [];

            for (var i = 0; i < sigs.length; i++) {
                publicAddresses.push(sigs[i].GetAddress());
            }

            return publicAddresses;
        } catch (e) {
            var sig = Sigs.fromKeyInfo(network, privateKey)
            var publicAddresses = [];

            publicAddresses.push(sig.GetAddress());
            return publicAddresses;
        }
    }

    static async SignByPrivateKey(network, privateKey, privateType, msg) {
        await __wbg_init(filecoinSignerWasmUrl)
        try {
            var sigs = Sigs.fromSecp256k1(network, privateKey);

            switch (privateType) {
                case "secp256k1":
                    return sigs[0].Sign(msg)
                case "delegated":
                    return sigs[1].Sign(msg)
                default:
                    throw new Error("illegal private type " + privateType)
            }
        } catch (e) {
            var sig = Sigs.fromKeyInfo(network, privateKey)
            return sig.Sign(msg)
        }
    }

    static _getPrivateKeyByKeywords(keywords) {
        keywords = keywords.join(" ");
        return Wallet.fromPhrase(keywords).privateKey;

    }

    static fromSecp256k1(network, privateKey) {
        privateKey = privateKey.toLowerCase();
        switch (privateKey.length) {
            case 64:
                privateKey = BaseNone.fromHex(privateKey).getRaw();
                break;
            case 66:
                privateKey = getBytes(privateKey)
                break;
            default:
                throw new Error("Invalid private key")
        }

        return [new Secp256k1(network, privateKey), new Delegated(network, privateKey)];
    }

    static fromKeyInfo(network, keyInfo) {
        var key_info = JSON.parse(BaseNone.fromHex(keyInfo).toUTF8());

        if (!key_info.hasOwnProperty("Type") && !key_info.hasOwnProperty("PrivateKey")) {
            throw new Error("illegal private key")
        }

        var privateKey = BaseNone.fromBase64(key_info.PrivateKey).getRaw();
        switch (key_info.Type) {
            case "secp256k1":
                return new Secp256k1(network, privateKey);
            case "bls":
                return new Bls(network, privateKey);
            case "delegated":
                return new Delegated(network, privateKey)

            default:
                throw new Error("illegal private key")
        }
    }
}


class Secp256k1 {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey;
    }

    GetAddress() {
        return newSecp256k1Address(secp256k1PublicKey(new Uint8Array(this.priKey)), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(secp256k1Sign(new Uint8Array(this.priKey), msg));
    }
}


class Bls {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey;
    }

    GetAddress() {
        return newBLSAddress(blsPublicKey(new Uint8Array(this.priKey)), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(blsSign(new Uint8Array(this.priKey), msg))
    }
}


class Delegated {
    constructor(network, priKey) {
        if (network == "mainnet") {
            this.network = CoinType.MAIN;
        } else {
            this.network = CoinType.TEST;
        }

        this.priKey = priKey
    }

    GetAddress() {
        let publicKey = delegatedPublicKey(new Uint8Array(this.priKey));
        return newDelegatedAddress(10, getBytes(keccak256(publicKey.slice(1))).slice(12), this.network).toString();
    }

    Sign(msg) {
        return new Uint8Array(delegatedSign(new Uint8Array(this.priKey), msg));
    }
}

