    // rumus untuk menghitung jumlah investasi akhir akhir
    // Hasil = p [(1+i) ^ n -1]
    // p = jumlah modal
    // i = bunga poko
    // n = Jumlah Periode

// Capital Amount
let moneyInDeoposito = 350000000 //keuntungan 3.5% per tahun
let moneyInObligasi = 30 / 100 * 650000000 //keuntungan 13% pertahun
let moneyInSahamA = 35 / 100 * 650000000 //keuntungan 14.5% pertahun
let moneyInSahamB = 650000000 - moneyInSahamA - moneyInObligasi; //keuntungan 12,5% pertahun

function rumus(capitalAmount, bankInterest, period) {
    // let capitalAmount;
    // let bankInterest;

    return capitalAmount * (1 + bankInterest) ** (period - 1)

}
rumus()

console.log('Hasil investasi di Deposito dengan bunga 3.5% Selama 2 tahun = ' + rumus(350000000, 3.5 / 100, 2))

console.log('Hasil investasi di Obligasi dengan bunga 13% Selama 2 tahun = ' + rumus(moneyInObligasi, 13 / 100, 2))

console.log('Hasil investasi di Saham A dengan bunga 14.5% Selama 2 tahun = ' + rumus(moneyInSahamA, 14.5 / 100, 2))

console.log('Hasil investasi di Saham B dengan bunga 12.5% Selama 2 tahun = ' + rumus(moneyInSahamB, 12.5 / 100, 2))

const totalAllMoney = rumus(350000000, 3.5 / 100, 2) + rumus(moneyInObligasi, 13 / 100, 2) + rumus(moneyInSahamA, 14.5 / 100, 2) + rumus(moneyInSahamB, 12.5 / 100, 2);

console.log('Total Keseluruhan uang investor setelah dua tahun ' + totalAllMoney)



