const { nanoid } = require("nanoid");
const books = require("./books");

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (name === undefined) {
    //jika nama kosong
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);

    return response;
  }

  if (readPage > pageCount) {
    // jika client membuat nilai readPage yang lebih besar dari nilai pageCount
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);

    return response;
  }

  const id = nanoid(16); // membuat angka random menggunakan nanoid sepanjang 16 karakter
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt; // nilai sama dengan insertedAt karena baru mulai nyimpen
  const finished = pageCount === readPage ? true : false; //kondisi ? nilai jika kondisi true : nilai jika kondisi false

  const newBook = {
    //// object literal, membuat key:value langsung dengan nama variabel yg sudah bernilai
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    insertedAt,
    updatedAt,
    finished,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0; //// method filter mengembalikan array

  if (isSuccess) {
    // kalau buku sukses ditambahkan
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);

    return response;
  }

  const response = h.response({
    // kalau buku gagal ditambahkan
    status: "error",
    message: "Buku gagal ditambahkan",
  });
  response.code(500);

  return response;
};

const getAllBooksHandler = (request, h) => {
  // mendapatkan data buku dari client
  const { name, reading, finished } = request.query;

  // membuat variable buku yang sudah di filter
  let filteredBooks = books;

  if (name !== undefined) {
    // jika nama tidak kosong
    filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (reading !== undefined) {
    // jika reading tidak kosong
    filteredBooks = filteredBooks.filter((book) => book.reading === !!Number(reading));
  }

  if (finished !== undefined) {
    // jika finished tidak kosong
    filteredBooks = filteredBooks.filter((book) => book.finished === !!Number(finished));
  }

  // jika sukses
  const response = h.response({
    status: "success",
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);

  return response;
};

const getBookByIdHandler = (request, h) => {
  // dapatkan dulu nilai id nya
  const { id } = request.params;

  // dapatkan objek book menggunakan array filter
  const book = books.filter((b) => b.id === id)[0];

  // jika buku tidak kosong
  if (book !== undefined) {
    return {
      status: "success",
      data: {
        book,
      },
    };
  }

  // jika buku kosong
  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);

  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  // mendapatkan nilai terbaru dari updatedAt
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    if (name === undefined) {
      // jika nama buku kosong
      const response = h.response({
        status: "fail",
        message: "Gagal memperbarui buku. Mohon isi nama buku",
      });
      response.code(400);

      return response;
    }

    if (readPage > pageCount) {
      const response = h.response({
        status: "fail",
        message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      });
      response.code(400);

      return response;
    }

    const finished = pageCount === readPage ? true : false;

    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);

    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);

    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };
