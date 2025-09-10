import PDFDocument from 'pdfkit-table';
import Listing from '../models/listing.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const generateOwnerReport = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Get all listings for the owner
    const listings = await Listing.find({ userRef: ownerId });

    // --- If no listings, use dummy row so table renders ---
    const tableData = listings.length > 0
      ? listings.map((listing) => ({
          name: listing.name || 'N/A',
          address: listing.address || 'N/A',
          type: listing.type || 'N/A',
          price: listing.regularPrice
            ? `$${listing.regularPrice}${listing.type === 'rent' ? '/month' : ''}`
            : 'N/A',
          bedrooms: listing.bedrooms ?? 'N/A',
          bathrooms: listing.bathrooms ?? 'N/A',
          parking: listing.parking ? 'Yes' : 'No',
          furnished: listing.furnished ? 'Yes' : 'No',
          created: listing.createdAt
            ? new Date(listing.createdAt).toLocaleDateString()
            : 'N/A',
        }))
      : [{ name: 'No Data', address: '-', type: '-', price: '-', bedrooms: '-', bathrooms: '-', parking: '-', furnished: '-', created: '-' }];

    // Create PDF document
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=owner-report.pdf');
      res.send(pdfData);
    });

    // --- Header ---
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#333').text('Owner Property Report', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#333').text('Property Summary:');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor('#444').text(`Total Properties: ${listings.length}`);
    doc.moveDown();

    // --- Table ---
    const table = {
      title: 'Properties',
      headers: [
        { label: 'Name', property: 'name' },
        { label: 'Address', property: 'address' },
        { label: 'Type', property: 'type' },
        { label: 'Price', property: 'price' },
        { label: 'Beds', property: 'bedrooms' },
        { label: 'Baths', property: 'bathrooms' },
        { label: 'Parking', property: 'parking' },
        { label: 'Furnished', property: 'furnished' },
        { label: 'Created', property: 'created' },
      ],
      datas: tableData,
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(9),
      border: true,
      width: doc.page.width - doc.options.margins * 2,
      columnSpacing: 5,
      padding: 5,
      columnsSize: null, // Let columns auto size dynamically
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

export const generateCustomerReport = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all listings for the customer (favorites, visited, etc.)
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found!'));
    }

    // Get favorites listings
    const favorites = await Listing.find({ _id: { $in: user.favorites || [] } });

    // Get visited listings
    const visitedListingIds = user.visitedProperties ? user.visitedProperties.map(vp => vp.listingId) : [];
    const visitedListings = await Listing.find({ _id: { $in: visitedListingIds } });

    // Prepare table data similar to owner report but for customer
    const tableData = visitedListings.length > 0
      ? visitedListings.map(listing => ({
          name: listing.name || 'N/A',
          address: listing.address || 'N/A',
          type: listing.type || 'N/A',
          price: listing.regularPrice
            ? `$${listing.regularPrice}${listing.type === 'rent' ? '/month' : ''}`
            : 'N/A',
          bedrooms: listing.bedrooms ?? 'N/A',
          bathrooms: listing.bathrooms ?? 'N/A',
          parking: listing.parking ? 'Yes' : 'No',
          furnished: listing.furnished ? 'Yes' : 'No',
          favorited: favorites.some(fav => fav._id.equals(listing._id)) ? 'Yes' : 'No',
        }))
      : [{ name: 'No Data', address: '-', type: '-', price: '-', bedrooms: '-', bathrooms: '-', parking: '-', furnished: '-', favorited: '-' }];

    // Create PDF document
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=customer-report.pdf');
      res.send(pdfData);
    });

    // --- Header ---
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#333').text('Customer Property Report', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#333').text('Property Summary:');
    doc.moveDown();
    doc.font('Helvetica').fontSize(12).fillColor('#444').text(`Total Properties: ${visitedListings.length}`);
    doc.moveDown();

    // --- Table ---
    const table = {
      title: 'Properties',
      headers: [
        { label: 'Name', property: 'name' },
        { label: 'Address', property: 'address' },
        { label: 'Type', property: 'type' },
        { label: 'Price', property: 'price' },
        { label: 'Beds', property: 'bedrooms' },
        { label: 'Baths', property: 'bathrooms' },
        { label: 'Parking', property: 'parking' },
        { label: 'Furnished', property: 'furnished' },
        { label: 'Favorited', property: 'favorited' },
      ],
      datas: tableData,
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(9),
      border: true,
      width: doc.page.width - doc.options.margins * 2,
      columnSpacing: 5,
      padding: 5,
      columnsSize: null, // Let columns auto size dynamically
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
